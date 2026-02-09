"use client";

import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Fade,
  Stack,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter, useSearchParams } from "next/navigation";
import { useCardStore } from "@/stores/useCardStore";
import { useStudyStore } from "@/stores/useStudyStore";
import MarkdownPreview from "@/components/common/MarkdownPreview";
import CardImage from "@/components/review/CardImage";
import type { ReviewRating, Card as CardType } from "@/types";

/**
 * 復習画面
 */
export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewContent />
    </Suspense>
  );
}

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId");
  const mode = searchParams.get("mode"); // "free" なら自由学習モード
  const isFreeMode = mode === "free";

  const getDueCards = useCardStore((s) => s.getDueCards);
  const getDueCardsByDeckId = useCardStore((s) => s.getDueCardsByDeckId);
  const getCardsByDeckId = useCardStore((s) => s.getCardsByDeckId);
  const applyReview = useCardStore((s) => s.applyReview);
  const recordReview = useStudyStore((s) => s.recordReview);
  const recordFreeStudy = useStudyStore((s) => s.recordFreeStudy);

  // 復習対象カードをシャッフルして保持
  const [reviewCards, setReviewCards] = useState<CardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // 初回マウント時にカードをシャッフルして取得
  useEffect(() => {
    let cards: CardType[];
    if (isFreeMode && deckId) {
      // 自由学習: デッキ内の全カードが対象
      cards = getCardsByDeckId(deckId);
    } else if (deckId) {
      cards = getDueCardsByDeckId(deckId);
    } else {
      cards = getDueCards();
    }
    // Fisher-Yates シャッフル
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setReviewCards(shuffled);
    if (shuffled.length === 0) {
      setIsCompleted(true);
    }
  }, []);

  const currentCard = reviewCards[currentIndex];
  const total = reviewCards.length;
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  const handleRate = useCallback(
    async (rating: ReviewRating) => {
      if (!currentCard) return;

      if (isFreeMode) {
        // 自由学習: SRS更新なし、カウントのみ
        await recordFreeStudy();
      } else {
        // 今日の復習: SRS更新 + rating付き学習記録
        await applyReview(currentCard.id, rating);
        await recordReview(rating);
      }

      // 次のカードへ遷移
      setFadeIn(false);
      setTimeout(() => {
        if (currentIndex + 1 >= total) {
          setIsCompleted(true);
        } else {
          setCurrentIndex((prev) => prev + 1);
          setShowAnswer(false);
        }
        setFadeIn(true);
      }, 200);
    },
    [currentCard, currentIndex, total, isFreeMode, applyReview, recordReview, recordFreeStudy]
  );

  // セッション完了画面
  if (isCompleted) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          p: 3,
        }}
      >
        <Typography variant="h4" sx={{ mb: 2 }}>
          🎉
        </Typography>
        <Typography variant="h5" gutterBottom>
          {isFreeMode ? "学習完了！" : "復習完了！"}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {total > 0
            ? `${total} 枚のカードを${isFreeMode ? "学習" : "復習"}しました`
            : isFreeMode
            ? "このデッキにカードがありません"
            : "今日の復習はありません"}
        </Typography>
        <Button variant="contained" onClick={() => router.push("/")}>
          ダッシュボードに戻る
        </Button>
      </Box>
    );
  }

  if (!currentCard) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* プログレスバー + 終了ボタン */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {isFreeMode && "自由学習 — "}
            {currentIndex + 1} / {total}
          </Typography>
          <IconButton size="small" onClick={() => router.push("/")}>
            <CloseIcon />
          </IconButton>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ borderRadius: 4, height: 6 }}
        />
      </Box>

      {/* カード表示エリア */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 3,
          maxWidth: 700,
          mx: "auto",
          width: "100%",
        }}
      >
        <Fade in={fadeIn} timeout={200}>
          <Card
            sx={{
              width: "100%",
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent sx={{ flex: 1, p: 3 }}>
              {!showAnswer ? (
                <>
                  {/* 表面 */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    問題
                  </Typography>
                  <MarkdownPreview content={currentCard.frontText} />
                  {currentCard.frontImageId && (
                    <Box sx={{ mt: 2 }}>
                      <CardImage imageId={currentCard.frontImageId} />
                    </Box>
                  )}
                </>
              ) : (
                <>
                  {/* 裏面 */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    答え
                  </Typography>
                  <MarkdownPreview content={currentCard.backText} />
                  {currentCard.backImageId && (
                    <Box sx={{ mt: 2 }}>
                      <CardImage imageId={currentCard.backImageId} />
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Fade>

        {/* アクションボタン */}
        <Box sx={{ mt: 3, width: "100%" }}>
          {!showAnswer ? (
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => setShowAnswer(true)}
            >
              答えを見る
            </Button>
          ) : (
            <Stack spacing={1}>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                理解度を選択してください
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  fullWidth
                  color="error"
                  onClick={() => handleRate("again")}
                >
                  難しい
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  color="warning"
                  onClick={() => handleRate("hard")}
                >
                  普通
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  color="success"
                  onClick={() => handleRate("good")}
                >
                  簡単
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
