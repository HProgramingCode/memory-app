/**
 * Memory App - 型定義
 */

/** デッキ */
export interface Deck {
  id: string;
  name: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

/** カード */
export interface Card {
  id: string;
  deckId: string;
  /** 表面テキスト (Markdown) */
  frontText: string;
  /** 裏面テキスト (Markdown) */
  backText: string;
  /** 表面画像ID (IndexedDB内のキー、nullなら画像なし) */
  frontImageId: string | null;
  /** 裏面画像ID */
  backImageId: string | null;
  /** SRS: 次回復習日 (ISO 8601 日付文字列 YYYY-MM-DD) */
  nextReviewDate: string;
  /** SRS: 現在の復習間隔（日数） */
  intervalDays: number;
  /** SRS: 連続正解回数 */
  repetitionCount: number;
  /** SRS: 習熟度ファクター */
  easeFactor: number;
  createdAt: string;
  updatedAt: string;
}

/** 自己評価 */
export type ReviewRating = "again" | "hard" | "good";

/** 学習記録（1日の学習実績） */
export interface StudyRecord {
  /** 日付 (YYYY-MM-DD) */
  date: string;
  /** その日に復習したカード数 */
  reviewedCount: number;
}

/** エクスポート用データ構造 */
export interface ExportData {
  version: 1;
  exportedAt: string;
  decks: Deck[];
  cards: Card[];
  studyRecords: StudyRecord[];
  /** Base64エンコードされた画像データ */
  images: { id: string; data: string; type: string }[];
}

/** 画像のバリデーション定数 */
export const IMAGE_CONSTRAINTS = {
  maxSizeBytes: 3 * 1024 * 1024, // 3MB
  allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
} as const;
