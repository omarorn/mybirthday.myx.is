/**
 * Centralized in-memory state for the birthday portal worker.
 * All Maps and mutable state live here so route modules can share them.
 */

import type {
  RsvpRecord,
  QuizSummary,
  QuizRecentAnswer,
  PlayerStats,
  TenantConfig,
  PhotoWallItem,
  PlannerApplication,
  EventRecord,
  SelfieItem,
  KaraokeSong,
  QuizQuestion,
} from "./types";

export const memoryStore = new Map<string, RsvpRecord>();
export const memoryCustomQuestions = new Map<number, QuizQuestion>();

let _memoryQuizSummary: QuizSummary = {
  totalAnswers: 0,
  totalCorrect: 0,
  questionStats: {},
};
export function getMemoryQuizSummary(): QuizSummary {
  return _memoryQuizSummary;
}
export function setMemoryQuizSummary(value: QuizSummary): void {
  _memoryQuizSummary = value;
}

let _memoryRecentAnswers: QuizRecentAnswer[] = [];
export function getMemoryRecentAnswers(): QuizRecentAnswer[] {
  return _memoryRecentAnswers;
}
export function setMemoryRecentAnswers(value: QuizRecentAnswer[]): void {
  _memoryRecentAnswers = value;
}

export const memoryTenants = new Map<string, TenantConfig>();
export const memoryPhotoWall = new Map<string, PhotoWallItem[]>();
export const memoryPlannerApplications = new Map<string, PlannerApplication[]>();
export const memoryPlayerStats = new Map<string, PlayerStats>();
export const memoryEvents = new Map<string, EventRecord>();
export const memoryEventSlugIndex = new Map<string, string>();
export const memoryOwnerEventIds = new Map<string, string[]>();
export const memorySelfies = new Map<string, SelfieItem[]>();
export const memoryKaraokeSongs = new Map<string, KaraokeSong[]>();
export const memoryKaraokeAudio = new Map<string, string>();
