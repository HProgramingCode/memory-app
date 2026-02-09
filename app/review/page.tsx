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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

  // 自由学習の開始ダイアログ
  const [showStartDialog, setShowStartDialog] = useState(false);
  const getLastStudyIndex = useStudyStore((s) => s.getLastStudyIndex);
  const setLastStudyIndex = useStudyStore((s) => s.setLastStudyIndex);

  // 復習対象カードをシャッフルして保持
  const [reviewCards, setReviewCards] = useState<CardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // 初回マウント時にカードを取得
  useEffect(() => {
    if (!deckId) return;

    let cards: CardType[] = [];
    if (isFreeMode) {
      // 自由学習: デッキ内の全カードが対象
      cards = getCardsByDeckId(deckId);
      // 中断データがあるか確認
      const lastIndex = getLastStudyIndex(deckId);
      if (lastIndex > 0 && lastIndex < cards.length) {
        // ダイアログを表示して user に選ばせる
        setShowStartDialog(true);
        // 一時的に保持（まだ開始しない）
        setReviewCards(cards);
        return;
      }
      // 中断データがない場合は「初めから」と同じ扱い（下へ続く）
    } else {
      cards = getDueCardsByDeckId(deckId);
      if (cards.length === 0) {
        setIsCompleted(true);
        return;
      }
    }

    // 通常モード or 自由学習(初回)
    // 中断データがない場合、または通常モードなら即開始
    if (!isFreeMode || (isFreeMode && getLastStudyIndex(deckId) === 0)) {
      startSession(cards, 0, true); // 初回はシャッフル
    }
  }, [deckId, isFreeMode, getCardsByDeckId, getDueCardsByDeckId, getLastStudyIndex]);

  const startSession = (cards: CardType[], startIndex: number, shuffle: boolean) => {
    let targetCards = [...cards];
    if (shuffle) {
      // Fisher-Yates シャッフル
      for (let i = targetCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [targetCards[i], targetCards[j]] = [targetCards[j], targetCards[i]];
      }
    } else {
      // シャッフルしない場合（続きから）
      // そのままの順序（ID順など）で利用
    }

    setReviewCards(targetCards);
    setCurrentIndex(startIndex);
    if (targetCards.length === 0 || startIndex >= targetCards.length) {
      setIsCompleted(true);
    }
    setShowStartDialog(false);
  };

  const currentCard = reviewCards[currentIndex];
  const total = reviewCards.length;
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  // インデックスが変わるたびに保存（自由学習のみ）
  useEffect(() => {
    if (isFreeMode && deckId && reviewCards.length > 0) {
      setLastStudyIndex(deckId, currentIndex);
    }
  }, [currentIndex, isFreeMode, deckId, reviewCards, setLastStudyIndex]);

  const handleNext = useCallback(async () => {
    if (!currentCard) return;

    if (isFreeMode) {
      await recordFreeStudy();
    }

    setFadeIn(false);
    setTimeout(() => {
      if (currentIndex + 1 >= total) {
        setIsCompleted(true);
        if (isFreeMode && deckId) {
          setLastStudyIndex(deckId, 0); // 完了したらリセット
        }
      } else {
        setCurrentIndex((prev) => prev + 1);
        setShowAnswer(false);
      }
      setFadeIn(true);
    }, 200);
  }, [currentCard, currentIndex, total, isFreeMode, deckId, recordFreeStudy, setLastStudyIndex]);

  const handleRate = useCallback(
    async (rating: ReviewRating) => {
      if (!currentCard) return;

      if (isFreeMode) {
        await handleNext();
        return;
      }

      await applyReview(currentCard.id, rating);
      await recordReview(rating);

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
    [currentCard, currentIndex, total, isFreeMode, applyReview, recordReview, handleNext]
  );

  const handleFinish = () => {
    router.push("/");
  };


  // ダイアログ表示
  if (showStartDialog) {
    return (
      <Dialog open={true}>
        <DialogTitle>学習を再開しますか？</DialogTitle>
        <DialogContent>
          <Typography>
            前回の続きから ({getLastStudyIndex(deckId!) + 1} / {reviewCards.length}) 開始しますか？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => startSession(reviewCards, 0, true)}>
            初めから（シャッフル）
          </Button>
          <Button onClick={() => startSession(reviewCards, getLastStudyIndex(deckId!), false)} autoFocus>
            続きから
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // 完了画面
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
          ) : isFreeMode ? (
            <Stack spacing={2}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleNext}
              >
                次へ
              </Button>
              <Button
                variant="outlined"
                fullWidth
                color="secondary"
                onClick={handleFinish}
              >
                終了
              </Button>
            </Stack>
          ) : (
            <Stack spacing={1}>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                理解度を選択してください
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
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
