import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { format, addDays } from "date-fns";
import {
  calculateNextReview,
  isDueToday,
  isMastered,
  getTodayString,
  SRS_DEFAULTS,
  MASTERED_THRESHOLD_DAYS,
} from "@/lib/srs";
import {
  baseCard,
  reviewedCard,
  masteredCard,
  lowEaseCard,
  tomorrowDueCard,
  createCard,
} from "@testcase/fixtures/card";

describe("SRS アルゴリズム (lib/srs.ts)", () => {
  const fixedDate = new Date("2026-02-18T00:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers({ now: fixedDate });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("calculateNextReview", () => {
    describe("again（難しい）", () => {
      it("TC-UNIT-01-01: 初回カード - 間隔リセット、翌日復習", () => {
        const card = baseCard;
        const result = calculateNextReview(card, "again");

        expect(result.intervalDays).toBe(1);
        expect(result.repetitionCount).toBe(0);
        expect(result.easeFactor).toBe(2.3);
        expect(result.nextReviewDate).toBe(
          format(addDays(fixedDate, 1), "yyyy-MM-dd")
        );
      });

      it("TC-UNIT-01-02: easeFactor 下限 - 1.3 を下回らない", () => {
        const card = lowEaseCard;
        const result = calculateNextReview(card, "again");

        expect(result.easeFactor).toBe(1.3);
        expect(result.intervalDays).toBe(1);
        expect(result.repetitionCount).toBe(0);
        expect(result.nextReviewDate).toBe(
          format(addDays(fixedDate, 1), "yyyy-MM-dd")
        );
      });
    });

    describe("hard（普通）", () => {
      it("TC-UNIT-01-03: 初回カード - 翌日復習", () => {
        const card = baseCard;
        const result = calculateNextReview(card, "hard");

        expect(result.intervalDays).toBe(1);
        expect(result.repetitionCount).toBe(1);
        expect(result.easeFactor).toBe(2.4);
        expect(result.nextReviewDate).toBe(
          format(addDays(fixedDate, 1), "yyyy-MM-dd")
        );
      });

      it("TC-UNIT-01-04: 2回目以降 - 間隔 1.5 倍", () => {
        const card = reviewedCard;
        const result = calculateNextReview(card, "hard");

        expect(result.intervalDays).toBe(6);
        expect(result.repetitionCount).toBe(3);
        expect(result.easeFactor).toBe(2.4);
        expect(result.nextReviewDate).toBe(
          format(addDays(fixedDate, 6), "yyyy-MM-dd")
        );
      });
    });

    describe("good（簡単）", () => {
      it("TC-UNIT-01-05: 初回カード - 3日後復習", () => {
        const card = baseCard;
        const result = calculateNextReview(card, "good");

        expect(result.intervalDays).toBe(3);
        expect(result.repetitionCount).toBe(1);
        expect(result.easeFactor).toBe(2.6);
        expect(result.nextReviewDate).toBe(
          format(addDays(fixedDate, 3), "yyyy-MM-dd")
        );
      });

      it("TC-UNIT-01-06: 2回目以降 - 間隔 easeFactor 倍", () => {
        const card = createCard({
          intervalDays: 3,
          repetitionCount: 1,
          easeFactor: 2.6,
        });
        const result = calculateNextReview(card, "good");

        expect(result.intervalDays).toBe(8);
        expect(result.repetitionCount).toBe(2);
        expect(result.easeFactor).toBe(2.7);
        expect(result.nextReviewDate).toBe(
          format(addDays(fixedDate, 8), "yyyy-MM-dd")
        );
      });
    });
  });

  describe("isDueToday", () => {
    it("TC-UNIT-01-07: 今日の日付なら true", () => {
      const card = createCard({
        nextReviewDate: format(fixedDate, "yyyy-MM-dd"),
      });
      expect(isDueToday(card)).toBe(true);
    });

    it("TC-UNIT-01-07: 過去の日付でも true", () => {
      const card = createCard({
        nextReviewDate: "2026-02-17",
      });
      expect(isDueToday(card)).toBe(true);
    });

    it("TC-UNIT-01-08: 未来の日付なら false", () => {
      const card = tomorrowDueCard;
      expect(isDueToday(card)).toBe(false);
    });
  });

  describe("isMastered", () => {
    it("TC-UNIT-01-09: intervalDays >= 21 なら true", () => {
      const card = masteredCard;
      expect(isMastered(card)).toBe(true);
    });

    it("TC-UNIT-01-09: intervalDays === 21 の境界", () => {
      const card = createCard({ intervalDays: 21 });
      expect(isMastered(card)).toBe(true);
    });

    it("TC-UNIT-01-10: intervalDays < 21 なら false", () => {
      const card = createCard({ intervalDays: 20 });
      expect(isMastered(card)).toBe(false);
    });
  });

  describe("getTodayString", () => {
    it("今日の日付を YYYY-MM-DD 形式で返す", () => {
      expect(getTodayString()).toBe("2026-02-18");
    });
  });

  describe("定数", () => {
    it("SRS_DEFAULTS が正しい初期値を持つ", () => {
      expect(SRS_DEFAULTS.intervalDays).toBe(0);
      expect(SRS_DEFAULTS.repetitionCount).toBe(0);
      expect(SRS_DEFAULTS.easeFactor).toBe(2.5);
    });

    it("MASTERED_THRESHOLD_DAYS が 21", () => {
      expect(MASTERED_THRESHOLD_DAYS).toBe(21);
    });
  });
});
