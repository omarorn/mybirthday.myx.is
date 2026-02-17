/**
 * Shared type definitions for the birthday portal worker.
 */

export { type QuizQuestion } from "./quizData";

export interface RsvpRecord {
  id: string;
  name: string;
  contact: string;
  method: "sms" | "google";
  attending: boolean;
  partySize?: number;
  plusOne?: string;
  dietary?: string;
  note?: string;
  updatedAt: string;
}

export interface QuizSummary {
  totalAnswers: number;
  totalCorrect: number;
  questionStats: Record<
    string,
    {
      total: number;
      correct: number;
      optionCounts: number[];
    }
  >;
}

export interface QuizRecentAnswer {
  ts: string;
  questionId: number;
  choice: number;
  correct: boolean;
  playerId: string;
  playerName: string;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  totalAnswers: number;
  totalCorrect: number;
  lastAnswerDate: string | null;
}

export interface Env {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  QUIZ_DATA?: KVNamespace;
  ADMIN_PASSWORD?: string;
  AI?: Ai;
}

export interface TenantConfig {
  slug: string;
  title: string;
  hashtag: string;
  instagramHandle?: string;
  owner?: string;
  createdAt: string;
}

export interface PhotoWallItem {
  id: string;
  slug: string;
  imageUrl: string;
  caption?: string;
  sourceUrl?: string;
  addedAt: string;
}

export interface PlannerApplication {
  id: string;
  slug: string;
  type: "host_add" | "surprise_help";
  applicantName: string;
  contact: string;
  forGuest?: string;
  note: string;
  createdAt: string;
}

export interface EventRecord {
  id: string;
  ownerId: string;
  slug: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  timezone?: string;
  published: boolean;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface SelfieItem {
  id: string;
  slug?: string;
  imageKey?: string;
  imageData?: string;
  caption?: string;
  submittedBy: string;
  takenAt: string;
}

export interface KaraokeSong {
  id: string;
  title: string;
  artist?: string;
  audioKey: string;
  lyrics?: TranscriptSegment[];
  manualLyrics?: string;
  transcription?: string;
  vtt?: string;
  chords?: string[];
  preset?: boolean;
  duration?: number;
  addedBy: string;
  createdAt: string;
  status: "uploaded" | "transcribing" | "ready" | "error";
}

export interface TranscriptSegment {
  word: string;
  start: number;
  end: number;
}

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type JsonObject = Record<string, unknown>;
