import { format, addDays, addMinutes } from "date-fns";
import type { Card, ReviewRating } from "@/types";

/**
 * SRS (Spaced Repetition System) アルゴリズム
 *
 * SM-2 ベースの簡易実装。
 * 評価に応じて次回復習日と間隔を計算する。
 */

/** 新規カードのデフォルト値 */
export const SRS_DEFAULTS = {
  intervalDays: 0,
  repetitionCount: 0,
  easeFactor: 2.5,
} as const;

/** 定着済みと判定する間隔の閾値（日数） */
export const MASTERED_THRESHOLD_DAYS = 21;

/**
 * 評価に基づいてカードのSRSパラメータを更新する
 */
export function calculateNextReview(
  card: Card,
  rating: ReviewRating
): Pick<
  Card,
  "nextReviewDate" | "intervalDays" | "repetitionCount" | "easeFactor"
> {
  const now = new Date();

  switch (rating) {
    case "again": {
      // 難しい: 間隔リセット → 10分後（同日中に再復習の機会）
      // ただし日付ベースの管理のため、翌日に設定
      return {
        nextReviewDate: format(addDays(now, 1), "yyyy-MM-dd"),
        intervalDays: 1,
        repetitionCount: 0,
        easeFactor: Math.max(1.3, card.easeFactor - 0.2),
      };
    }
    case "hard": {
      // 普通: 間隔を少し伸ばす (x 1.5)
      const newInterval =
        card.intervalDays === 0
          ? 1 // 初回 → 翌日
          : Math.ceil(card.intervalDays * 1.5);
      return {
        nextReviewDate: format(addDays(now, newInterval), "yyyy-MM-dd"),
        intervalDays: newInterval,
        repetitionCount: card.repetitionCount + 1,
        easeFactor: Math.max(1.3, card.easeFactor - 0.1),
      };
    }
    case "good": {
      // 簡単: 間隔を大きく伸ばす (x easeFactor)
      const newInterval =
        card.intervalDays === 0
          ? 3 // 初回 → 3日後
          : Math.ceil(card.intervalDays * card.easeFactor);
      return {
        nextReviewDate: format(addDays(now, newInterval), "yyyy-MM-dd"),
        intervalDays: newInterval,
        repetitionCount: card.repetitionCount + 1,
        easeFactor: card.easeFactor + 0.1,
      };
    }
  }
}

/**
 * 今日の日付文字列を取得 (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * カードが今日復習対象かどうか判定
 */
export function isDueToday(card: Card): boolean {
  return card.nextReviewDate <= getTodayString();
}

/**
 * カードが「定着済み」かどうか判定
 * 次回復習間隔が21日以上なら定着済み
 */
export function isMastered(card: Card): boolean {
  return card.intervalDays >= MASTERED_THRESHOLD_DAYS;
}
