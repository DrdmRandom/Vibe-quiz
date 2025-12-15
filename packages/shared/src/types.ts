export type SessionStatus = 'LOBBY' | 'RUNNING' | 'REVEAL' | 'ENDED';

export interface QuizDTO {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  questions: QuestionDTO[];
}

export interface QuestionDTO {
  id: string;
  quizId: string;
  text: string;
  durationSec: number;
  order: number;
  choices: ChoiceDTO[];
}

export interface ChoiceDTO {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
}

export interface LivePlayerView {
  id: string;
  nickname: string;
  totalPoints: number;
  currentStreak: number;
  avgAnswerMs: number;
}

export interface LeaderboardEntry extends LivePlayerView {}

export interface QuestionRevealStats {
  questionId: string;
  correctChoiceId: string;
  leaderboardTop10: LeaderboardEntry[];
}

export interface LiveSessionState {
  pin: string;
  status: SessionStatus;
  players: LivePlayerView[];
  currentQuestionIndex: number;
}

export interface AnswerRequest {
  pin: string;
  questionId: string;
  choiceId: string;
}
