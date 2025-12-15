import { AnswerRequest, QuestionRevealStats, SessionStatus } from './types';

export type HostCreateSessionPayload = { quizId: string };
export type HostPinPayload = { pin: string };
export type HostStartPayload = HostPinPayload;
export type HostNextPayload = HostPinPayload;
export type HostRevealPayload = HostPinPayload;
export type HostEndPayload = HostPinPayload;

export type PlayerJoinPayload = { pin: string; nickname: string };
export type PlayerReconnectPayload = { pin: string; reconnectToken: string };
export type PlayerAnswerPayload = AnswerRequest;

export interface LobbyStateEvent {
  pin: string;
  players: { nickname: string; totalPoints: number }[];
}

export interface QuestionEvent {
  questionId: string;
  text: string;
  choices: { id: string; text: string }[];
  durationMs: number;
  startedAt: string;
}

export interface TickEvent {
  remainingMs: number;
}

export interface RevealEvent extends QuestionRevealStats {}

export interface LeaderboardEvent {
  leaderboard: { nickname: string; totalPoints: number; avgAnswerMs: number }[];
  status: SessionStatus;
}

export interface SessionEndedEvent {
  finalLeaderboard: LeaderboardEvent['leaderboard'];
  downloadableResultsUrl: string;
}
