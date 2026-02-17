/**
 * テスト用カードフィクスチャ
 *
 * ユニットテスト・E2E テストで使用するダミーカードデータ。
 * 実装時にコピペして使用する。
 */

import type { Card } from "@/types";

/** 基本カード（初回状態） */
export const baseCard: Card = {
  id: "test-card-1",
  deckId: "test-deck-1",
  frontText: "テスト問題",
  backText: "テスト回答",
  frontImageId: null,
  backImageId: null,
  nextReviewDate: "2026-02-18",
  intervalDays: 0,
  repetitionCount: 0,
  easeFactor: 2.5,
  createdAt: "2026-02-18T00:00:00.000Z",
  updatedAt: "2026-02-18T00:00:00.000Z",
};

/** 復習済みカード（intervalDays > 0） */
export const reviewedCard: Card = {
  ...baseCard,
  id: "test-card-2",
  intervalDays: 4,
  repetitionCount: 2,
  easeFactor: 2.5,
  nextReviewDate: "2026-02-18",
};

/** 定着済みカード（intervalDays >= 21） */
export const masteredCard: Card = {
  ...baseCard,
  id: "test-card-3",
  intervalDays: 21,
  repetitionCount: 5,
  easeFactor: 2.8,
  nextReviewDate: "2026-03-11",
};

/** easeFactor 下限付近のカード */
export const lowEaseCard: Card = {
  ...baseCard,
  id: "test-card-4",
  intervalDays: 1,
  repetitionCount: 1,
  easeFactor: 1.4,
  nextReviewDate: "2026-02-18",
};

/** 明日が復習日のカード（今日 due ではない） */
export const tomorrowDueCard: Card = {
  ...baseCard,
  id: "test-card-5",
  nextReviewDate: "2026-02-19",
  intervalDays: 1,
  repetitionCount: 1,
};

/**
 * カードを生成するヘルパー
 * @param overrides 上書きするプロパティ
 */
export function createCard(overrides: Partial<Card> = {}): Card {
  return {
    ...baseCard,
    id: `test-card-${Date.now()}`,
    ...overrides,
  };
}
