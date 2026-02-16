import {
  upsertStudyRecordRepo,
  upsertStudyRecordReviewRepo,
} from "./repository";
import type { Rating } from "@/types";

export async function recordFreeStudy(userId: string, date: string) {
  return upsertStudyRecordRepo(userId, date);
}

export async function recordReview(
  userId: string,
  date: string,
  rating: Rating
) {
  const increment = {
    reviewedCount: 1,
    againCount: rating === "again" ? 1 : 0,
    hardCount: rating === "hard" ? 1 : 0,
    goodCount: rating === "good" ? 1 : 0,
  };

  return upsertStudyRecordReviewRepo(userId, date, increment);
}
