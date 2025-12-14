export type Choice = {
  id: number;
  text: string;
};

export type QuestionForm = {
  id: number;
  prompt: string;
  timeLimit: number;
  choices: string[];
  correctIndex: number;
};

export type Quiz = {
  id: string;
  title: string;
  questions: QuestionForm[];
};

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type ScoreboardEntry = {
  name: string;
  score: number;
  rank?: number;
};

export type RoomState = {
  pin: string;
  players: Player[];
};

export type RevealPayload = {
  correctIndex: number;
  answerCounts: number[];
  leaderboard: ScoreboardEntry[];
};
