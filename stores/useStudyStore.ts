import { create } from "zustand";
import { getTodayString } from "@/lib/srs";
import type { StudyRecord, ReviewRating } from "@/types";

interface StudyState {
  records: StudyRecord[];
  initialized: boolean;

  /** API から学習記録を取得してストアを初期化 */
  fetchRecords: () => Promise<void>;

  /** 今日の復習を1枚完了したことを記録（rating付き） */
  recordReview: (rating: ReviewRating) => Promise<void>;

  /** 自由学習を1枚完了したことを記録 */
  recordFreeStudy: () => Promise<void>;

  /** 連続学習日数（ストリーク）を取得 */
  getStreak: () => number;

  /** 今日の復習枚数を取得 */
  getTodayReviewedCount: () => number;

  /** 今日の自由学習枚数を取得 */
  getTodayFreeStudyCount: () => number;

  /** 今日の学習合計枚数を取得（復習 + 自由学習） */
  getTodayTotalStudyCount: () => number;

  /** 今日の復習セッション定着率を取得（%） */
  getTodaySessionMasteryRate: () => number | null;

  /** 今日のレコードを取得 */
  getTodayRecord: () => StudyRecord | undefined;

  /** インポート用: ストアのデータを直接置換 */
  replaceAll: (records: StudyRecord[]) => void;
}

/** ストア内で record を upsert するヘルパー */
function upsertRecord(
  state: { records: StudyRecord[] },
  record: StudyRecord
): { records: StudyRecord[] } {
  const existing = state.records.find((r) => r.date === record.date);
  if (existing) {
    return {
      records: state.records.map((r) =>
        r.date === record.date ? record : r
      ),
    };
  }
  return { records: [...state.records, record] };
}

export const useStudyStore = create<StudyState>()((set, get) => ({
  records: [],
  initialized: false,

  fetchRecords: async () => {
    const res = await fetch("/api/study-records");
    if (!res.ok) throw new Error("Failed to fetch study records");
    const records: StudyRecord[] = await res.json();
    set({ records, initialized: true });
  },

  recordReview: async (rating: ReviewRating) => {
    const res = await fetch("/api/study-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });
    if (!res.ok) throw new Error("Failed to record review");
    const record: StudyRecord = await res.json();
    set((state) => upsertRecord(state, record));
  },

  recordFreeStudy: async () => {
    const res = await fetch("/api/study-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "free" }),
    });
    if (!res.ok) throw new Error("Failed to record free study");
    const record: StudyRecord = await res.json();
    set((state) => upsertRecord(state, record));
  },

  getStreak: () => {
    const records = get().records;
    if (records.length === 0) return 0;

    // 復習 or 自由学習のどちらかをした日をストリーク対象とする
    const sortedDates = records
      .filter((r) => r.reviewedCount > 0 || r.freeStudyCount > 0)
      .map((r) => r.date)
      .sort((a, b) => b.localeCompare(a));

    if (sortedDates.length === 0) return 0;

    const today = getTodayString();
    let streak = 0;
    let checkDate = today;

    if (sortedDates[0] === today) {
      streak = 1;
      const d = new Date();
      d.setDate(d.getDate() - 1);
      checkDate = formatDate(d);
    } else {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const yesterday = formatDate(d);
      if (sortedDates[0] !== yesterday) {
        return 0;
      }
      checkDate = yesterday;
    }

    const dateSet = new Set(sortedDates);
    while (dateSet.has(checkDate)) {
      if (checkDate !== today || streak === 0) {
        streak++;
      }
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = formatDate(d);
    }

    return streak;
  },

  getTodayReviewedCount: () => {
    const today = getTodayString();
    const record = get().records.find((r) => r.date === today);
    return record?.reviewedCount ?? 0;
  },

  getTodayFreeStudyCount: () => {
    const today = getTodayString();
    const record = get().records.find((r) => r.date === today);
    return record?.freeStudyCount ?? 0;
  },

  getTodayTotalStudyCount: () => {
    const today = getTodayString();
    const record = get().records.find((r) => r.date === today);
    if (!record) return 0;
    return record.reviewedCount + record.freeStudyCount;
  },

  getTodaySessionMasteryRate: () => {
    const today = getTodayString();
    const record = get().records.find((r) => r.date === today);
    if (!record) return null;
    const total = record.againCount + record.hardCount + record.goodCount;
    if (total === 0) return null;
    // 「普通」「簡単」を定着とみなす
    return Math.round(((record.hardCount + record.goodCount) / total) * 100);
  },

  getTodayRecord: () => {
    const today = getTodayString();
    return get().records.find((r) => r.date === today);
  },

  replaceAll: (records) => {
    set({ records });
  },
}));

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
