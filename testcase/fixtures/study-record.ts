/**
 * テスト用学習記録フィクスチャ
 *
 * ユニットテスト・E2E テストで使用するダミー学習記録データ。
 */

import type { StudyRecord } from "@/types";

/** 今日の学習記録（空） */
export const emptyStudyRecord: StudyRecord = {
  date: "2026-02-18",
  reviewedCount: 0,
  freeStudyCount: 0,
  againCount: 0,
  hardCount: 0,
  goodCount: 0,
};

/** 今日の学習記録（復習済み） */
export const reviewedStudyRecord: StudyRecord = {
  date: "2026-02-18",
  reviewedCount: 5,
  freeStudyCount: 0,
  againCount: 1,
  hardCount: 2,
  goodCount: 2,
};

/** 今日の学習記録（自由学習含む） */
export const mixedStudyRecord: StudyRecord = {
  date: "2026-02-18",
  reviewedCount: 3,
  freeStudyCount: 2,
  againCount: 0,
  hardCount: 1,
  goodCount: 2,
};

/**
 * 学習記録を生成するヘルパー
 * @param overrides 上書きするプロパティ
 */
export function createStudyRecord(
  overrides: Partial<StudyRecord> = {}
): StudyRecord {
  return {
    ...emptyStudyRecord,
    ...overrides,
  };
}
