/**
 * テスト用デッキフィクスチャ
 *
 * ユニットテスト・E2E テストで使用するダミーデッキデータ。
 */

import type { Deck } from "@/types";

/** 基本デッキ */
export const baseDeck: Deck = {
  id: "test-deck-1",
  name: "テストデッキ",
  createdAt: "2026-02-18T00:00:00.000Z",
  updatedAt: "2026-02-18T00:00:00.000Z",
};

/** 空のデッキ（カードなし想定） */
export const emptyDeck: Deck = {
  id: "test-deck-empty",
  name: "空のデッキ",
  createdAt: "2026-02-18T00:00:00.000Z",
  updatedAt: "2026-02-18T00:00:00.000Z",
};

/**
 * デッキを生成するヘルパー
 * @param overrides 上書きするプロパティ
 */
export function createDeck(overrides: Partial<Deck> = {}): Deck {
  return {
    ...baseDeck,
    id: `test-deck-${Date.now()}`,
    ...overrides,
  };
}
