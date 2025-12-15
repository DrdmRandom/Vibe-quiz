import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { QuizDto } from './dto';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  async list(ownerId: string) {
    return this.prisma.quiz.findMany({ where: { ownerId }, include: { questions: { include: { choices: true } } } });
  }

  async get(id: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id }, include: { questions: { include: { choices: true }, orderBy: { order: 'asc' } } } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async create(ownerId: string, data: QuizDto) {
    return this.prisma.quiz.create({
      data: {
        ownerId,
        title: data.title,
        description: data.description,
        isPublished: data.isPublished,
        questions: {
          create: data.questions.map((q) => ({
            text: q.text,
            durationSec: q.durationSec,
            order: q.order,
            choices: { create: q.choices.map((c) => ({ text: c.text, isCorrect: c.isCorrect })) },
          })),
        },
      },
      include: { questions: { include: { choices: true } } },
    });
  }

  async update(id: string, ownerId: string, data: QuizDto) {
    await this.get(id);
    await this.prisma.question.deleteMany({ where: { quizId: id } });
    return this.prisma.quiz.update({
      where: { id },
      data: {
        ownerId,
        title: data.title,
        description: data.description,
        isPublished: data.isPublished,
        questions: {
          create: data.questions.map((q) => ({
            text: q.text,
            durationSec: q.durationSec,
            order: q.order,
            choices: { create: q.choices.map((c) => ({ text: c.text, isCorrect: c.isCorrect })) },
          })),
        },
      },
      include: { questions: { include: { choices: true } } },
    });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.quiz.delete({ where: { id } });
  }
}
