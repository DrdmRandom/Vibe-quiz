import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { calculateScore, nextStreak } from '@vibequiz/shared';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class SessionsService {
  private timers = new Map<string, NodeJS.Timeout>();
  private logger = new Logger(SessionsService.name);

  constructor(private prisma: PrismaService) {}

  private generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createSession(hostUserId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId }, include: { questions: { include: { choices: true }, orderBy: { order: 'asc' } } } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    const pin = this.generatePin();
    const session = await this.prisma.liveSession.create({ data: { quizId, hostUserId, pin }, include: { quiz: { include: { questions: { include: { choices: true }, orderBy: { order: 'asc' } } } } } });
    return session;
  }

  async getSessionByPin(pin: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { pin },
      include: { quiz: { include: { questions: { include: { choices: true }, orderBy: { order: 'asc' } } } }, players: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async addPlayer(pin: string, nickname: string) {
    const session = await this.getSessionByPin(pin);
    try {
      const player = await this.prisma.livePlayer.create({ data: { sessionId: session.id, nickname } });
      return player;
    } catch (e) {
      throw new BadRequestException('Nickname already taken');
    }
  }

  async reconnectPlayer(pin: string, token: string) {
    const session = await this.getSessionByPin(pin);
    const player = await this.prisma.livePlayer.findFirst({ where: { sessionId: session.id, reconnectToken: token } });
    if (!player) throw new NotFoundException('Player not found');
    await this.prisma.livePlayer.update({ where: { id: player.id }, data: { isConnected: true, lastSeenAt: new Date() } });
    return player;
  }

  async startSession(pin: string) {
    const session = await this.getSessionByPin(pin);
    if (session.status !== SessionStatus.LOBBY) return session;
    const started = await this.prisma.liveSession.update({ where: { id: session.id }, data: { status: SessionStatus.RUNNING, startedAt: new Date(), currentQuestionIndex: 0 } });
    return this.broadcastQuestion(started.pin);
  }

  async broadcastQuestion(pin: string) {
    const session = await this.getSessionByPin(pin);
    const question = session.quiz.questions[session.currentQuestionIndex];
    if (!question) {
      return this.endSession(pin);
    }
    const durationMs = question.durationSec * 1000;
    const startedAt = new Date();
    // set timer for auto reveal
    this.clearTimer(pin);
    this.timers.set(
      pin,
      setTimeout(() => this.revealNow(pin).catch((err) => this.logger.error(err)), durationMs)
    );
    return { question, durationMs, startedAt };
  }

  async revealNow(pin: string) {
    const session = await this.getSessionByPin(pin);
    if (session.status === SessionStatus.REVEAL) return session;
    await this.prisma.liveSession.update({ where: { id: session.id }, data: { status: SessionStatus.REVEAL } });
    const question = session.quiz.questions[session.currentQuestionIndex];
    if (!question) throw new BadRequestException('No question to reveal');

    const correctChoice = question.choices.find((c) => c.isCorrect)!;
    const leaderboardTop10 = await this.getLeaderboard(pin, 10);
    return { questionId: question.id, correctChoiceId: correctChoice.id, leaderboardTop10 };
  }

  async nextQuestion(pin: string) {
    const session = await this.getSessionByPin(pin);
    if (session.currentQuestionIndex + 1 >= session.quiz.questions.length) {
      return this.endSession(pin);
    }
    const updated = await this.prisma.liveSession.update({
      where: { id: session.id },
      data: { status: SessionStatus.RUNNING, currentQuestionIndex: { increment: 1 } },
    });
    return this.broadcastQuestion(updated.pin);
  }

  async endSession(pin: string) {
    const session = await this.getSessionByPin(pin);
    if (session.status === SessionStatus.ENDED) return session;
    this.clearTimer(pin);
    return this.prisma.liveSession.update({ where: { id: session.id }, data: { status: SessionStatus.ENDED, endedAt: new Date() } });
  }

  async recordAnswer(pin: string, playerId: string, questionId: string, choiceId: string, answerMs: number) {
    const session = await this.getSessionByPin(pin);
    const question = session.quiz.questions.find((q) => q.id === questionId);
    if (!question) throw new BadRequestException('Question mismatch');
    const existing = await this.prisma.liveAnswer.findFirst({ where: { sessionId: session.id, playerId, questionId } });
    if (existing) throw new BadRequestException('Already answered');
    const choice = await this.prisma.choice.findUnique({ where: { id: choiceId } });
    if (!choice) throw new BadRequestException('Invalid choice');
    const isCorrect = choice.isCorrect;
    const streak = await this.prisma.livePlayer.findUnique({ where: { id: playerId } });
    if (!streak) throw new NotFoundException('Player not found');
    const newStreak = nextStreak(streak.currentStreak, isCorrect);
    const awardedPoints = isCorrect ? calculateScore({ totalMs: question.durationSec * 1000, remainingMs: Math.max(0, question.durationSec * 1000 - answerMs), streak: newStreak }) : 0;

    await this.prisma.liveAnswer.create({
      data: { sessionId: session.id, playerId, questionId, choiceId, isCorrect, answerMs, awardedPoints },
    });

    const answers = await this.prisma.liveAnswer.findMany({ where: { playerId } });
    const avg = Math.round(answers.reduce((acc, a) => acc + a.answerMs, 0) / answers.length);
    await this.prisma.livePlayer.update({
      where: { id: playerId },
      data: { totalPoints: { increment: awardedPoints }, currentStreak: newStreak, avgAnswerMs: avg },
    });
    return { isCorrect, awardedPoints };
  }

  async getLeaderboard(pin: string, take = 100) {
    const session = await this.getSessionByPin(pin);
    const players = await this.prisma.livePlayer.findMany({ where: { sessionId: session.id } });
    return players
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        return a.avgAnswerMs - b.avgAnswerMs;
      })
      .slice(0, take)
      .map((p) => ({ nickname: p.nickname, totalPoints: p.totalPoints, avgAnswerMs: p.avgAnswerMs }));
  }

  async downloadResults(pin: string) {
    const session = await this.getSessionByPin(pin);
    const answers = await this.prisma.liveAnswer.findMany({ where: { sessionId: session.id } });
    return { session, answers };
  }

  private clearTimer(pin: string) {
    const timer = this.timers.get(pin);
    if (timer) clearTimeout(timer);
    this.timers.delete(pin);
  }
}
