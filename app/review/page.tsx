"use client";

import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
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
import ReviewLoading from "@/app/review/loading";
import type { ReviewRating, Card as CardType } from "@/types";

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
  const mode = searchParams.get("mode");
  const isFreeMode = mode === "free";

  const cards = useCardStore((s) => s.cards);
  const getDueCards = useCardStore((s) => s.getDueCards);
  const getDueCardsByDeckId = useCardStore((s) => s.getDueCardsByDeckId);
  const getCardsByDeckId = useCardStore((s) => s.getCardsByDeckId);
  const applyReview = useCardStore((s) => s.applyReview);
  const recordReview = useStudyStore((s) => s.recordReview);
  const recordFreeStudy = useStudyStore((s) => s.recordFreeStudy);

  const [showStartDialog, setShowStartDialog] = useState(false);
  const getLastStudyIndex = useStudyStore((s) => s.getLastStudyIndex);
  const setLastStudyIndex = useStudyStore((s) => s.setLastStudyIndex);

  const [reviewCards, setReviewCards] = useState<CardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isFreeMode && cards.length === 0) return;

    let targetCards: CardType[] = [];
    if (isFreeMode) {
      if (!deckId) {
        setIsCompleted(true);
        return;
      }
      targetCards = getCardsByDeckId(deckId);
      const lastIndex = getLastStudyIndex(deckId);
      if (lastIndex > 0 && lastIndex < targetCards.length) {
        setShowStartDialog(true);
        setReviewCards(targetCards);
        return;
      }
    } else {
      targetCards = deckId ? getDueCardsByDeckId(deckId) : getDueCards();
      if (targetCards.length === 0) {
        setIsCompleted(true);
        return;
      }
    }
    if (!isFreeMode || (isFreeMode && deckId && getLastStudyIndex(deckId) === 0)) {
      startSession(targetCards, 0, true);
    }
  }, [deckId, isFreeMode, cards.length, getCardsByDeckId, getDueCardsByDeckId, getDueCards, getLastStudyIndex]);

  const startSession = (cards: CardType[], startIndex: number, shuffle: boolean) => {
    let targetCards = [...cards];
    if (shuffle) {
      for (let i = targetCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [targetCards[i], targetCards[j]] = [targetCards[j], targetCards[i]];
      }
    }
    setReviewCards(targetCards);
    setCurrentIndex(startIndex);
    if (targetCards.length === 0 || startIndex >= targetCards.length) setIsCompleted(true);
    setShowStartDialog(false);
  };

  const currentCard = reviewCards[currentIndex];
  const total = reviewCards.length;
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  useEffect(() => {
    if (isFreeMode && deckId && reviewCards.length > 0) setLastStudyIndex(deckId, currentIndex);
  }, [currentIndex, isFreeMode, deckId, reviewCards, setLastStudyIndex]);

  const flipToAnswer = useCallback(() => {
    if (isProcessing) return;
    setIsFlipped(true);
    setTimeout(() => setShowAnswer(true), 300);
  }, [isProcessing]);

  const advanceCard = useCallback(() => {
    setIsFlipped(false);
    setShowAnswer(false);
    setTimeout(() => {
      if (currentIndex + 1 >= total) {
        setIsCompleted(true);
        if (isFreeMode && deckId) setLastStudyIndex(deckId, 0);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 200);
  }, [currentIndex, total, isFreeMode, deckId, setLastStudyIndex]);

  const handleNext = useCallback(async () => {
    if (!currentCard || isProcessing) return;
    setIsProcessing(true);
    try {
      if (isFreeMode) await recordFreeStudy();
      advanceCard();
    } finally { setIsProcessing(false); }
  }, [currentCard, isFreeMode, recordFreeStudy, advanceCard, isProcessing]);

  const handleRate = useCallback(async (rating: ReviewRating) => {
    if (!currentCard || isProcessing) return;
    setIsProcessing(true);
    try {
      if (isFreeMode) { await handleNext(); return; }
      await applyReview(currentCard.id, rating);
      await recordReview(rating);
      advanceCard();
    } finally { setIsProcessing(false); }
  }, [currentCard, isFreeMode, applyReview, recordReview, handleNext, advanceCard, isProcessing]);

  // ★ キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showStartDialog || isCompleted || isProcessing) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (!showAnswer) flipToAnswer();
        else if (isFreeMode) handleNext();
      } else if (showAnswer && !isFreeMode) {
        if (e.key === "1") { e.preventDefault(); handleRate("again"); }
        else if (e.key === "2") { e.preventDefault(); handleRate("hard"); }
        else if (e.key === "3") { e.preventDefault(); handleRate("good"); }
      } else if (showAnswer && isFreeMode && e.key === "Enter") {
        e.preventDefault(); handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAnswer, showStartDialog, isCompleted, isProcessing, isFreeMode, flipToAnswer, handleNext, handleRate]);

  if (!isFreeMode && cards.length === 0) {
    return <ReviewLoading />;
  }

  // ダイアログ
  if (showStartDialog) {
    return (
      <Dialog open={true}>
        <DialogTitle sx={{ fontWeight: 700 }}>学習を再開しますか？</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            前回の続きから ({getLastStudyIndex(deckId!) + 1} / {reviewCards.length}) 開始しますか？
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => startSession(reviewCards, 0, true)} sx={{ borderRadius: 2 }}>
            初めから（シャッフル）
          </Button>
          <Button variant="contained" onClick={() => startSession(reviewCards, getLastStudyIndex(deckId!), false)} autoFocus sx={{ borderRadius: 2 }}>
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
        <Box sx={{ textAlign: "center", animation: "fadeInUp 0.5s ease-out" }}>
          <Typography variant="h2" sx={{ mb: 1, animation: "celebrationBounce 1s ease-in-out infinite" }}>
            🎉
          </Typography>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: "primary.dark" }}>
            {isFreeMode ? "学習完了！" : "復習完了！"}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            {total > 0
              ? `${total} 枚のカードを${isFreeMode ? "学習" : "復習"}しました`
              : isFreeMode ? "このデッキにカードがありません" : "今日の復習はありません"}
          </Typography>
          {total > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              素晴らしい！継続が力になります 💪
            </Typography>
          )}
          <Button
            variant="contained"
            onClick={() => router.push("/")}
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
            }}
          >
            ダッシュボードに戻る
          </Button>
        </Box>
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
      {/* プログレスバー */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {isFreeMode && (
              <Box
                component="span"
                sx={{
                  px: 1, py: 0.25, borderRadius: 1,
                  bgcolor: "rgba(139, 92, 246, 0.1)", color: "#7c3aed",
                  fontSize: "0.7rem", fontWeight: 700, mr: 1,
                }}
              >
                自由学習
              </Box>
            )}
            {currentIndex + 1} / {total}
          </Typography>
          <IconButton size="small" onClick={() => router.push("/")} sx={{ color: "text.secondary" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <LinearProgress variant="determinate" value={progress} />
      </Box>

      {/* カード表示 — 3D Flip */}
      <Box
        sx={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          px: 2, py: 3, maxWidth: 700, mx: "auto", width: "100%",
        }}
      >
        <Box className="card-flip-container" sx={{ width: "100%", mb: 3 }}>
          <Box className={`card-flip-inner ${isFlipped ? "flipped" : ""}`}>
            {/* Front */}
            <Card className="card-flip-front" sx={{ width: "100%", minHeight: 300, display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flex: 1, p: 3 }}>
                <Box sx={{ display: "inline-block", px: 1.5, py: 0.5, borderRadius: 2, bgcolor: "rgba(99, 102, 241, 0.08)", mb: 2 }}>
                  <Typography variant="caption" sx={{ color: "#6366f1", fontWeight: 700, fontSize: "0.7rem" }}>
                    問題
                  </Typography>
                </Box>
                <MarkdownPreview content={currentCard.frontText} />
                {currentCard.frontImageId && <Box sx={{ mt: 2 }}><CardImage imageId={currentCard.frontImageId} /></Box>}
              </CardContent>
            </Card>
            {/* Back */}
            <Card className="card-flip-back" sx={{ width: "100%", minHeight: 300, display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flex: 1, p: 3 }}>
                <Box sx={{ display: "inline-block", px: 1.5, py: 0.5, borderRadius: 2, bgcolor: "rgba(16, 185, 129, 0.08)", mb: 2 }}>
                  <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 700, fontSize: "0.7rem" }}>
                    答え
                  </Typography>
                </Box>
                <MarkdownPreview content={currentCard.backText} />
                {currentCard.backImageId && <Box sx={{ mt: 2 }}><CardImage imageId={currentCard.backImageId} /></Box>}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ width: "100%" }}>
          {!showAnswer ? (
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={flipToAnswer}
              sx={{ py: 1.5, borderRadius: 3, fontSize: "0.95rem" }}
            >
              答えを見る
              <Box component="span" sx={{ ml: 1.5, opacity: 0.7 }}><kbd>Space</kbd></Box>
            </Button>
          ) : isFreeMode ? (
            <Stack spacing={2}>
              <Button variant="contained" fullWidth size="large" onClick={handleNext} disabled={isProcessing} sx={{ py: 1.5, borderRadius: 3 }}>
                次へ<Box component="span" sx={{ ml: 1.5, opacity: 0.7 }}><kbd>Space</kbd></Box>
              </Button>
              <Button variant="outlined" fullWidth onClick={() => router.push("/")} sx={{ borderRadius: 3 }}>終了</Button>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ fontWeight: 500 }}>
                理解度を選択してください
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  variant="outlined" fullWidth onClick={() => handleRate("again")} disabled={isProcessing}
                  sx={{
                    py: 1.5, borderRadius: 3, borderColor: "rgba(239, 68, 68, 0.3)", color: "#ef4444",
                    "&:hover": { borderColor: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.04)" },
                  }}
                >
                  難しい<Box component="span" sx={{ ml: 1, opacity: 0.7 }}><kbd>1</kbd></Box>
                </Button>
                <Button
                  variant="outlined" fullWidth onClick={() => handleRate("hard")} disabled={isProcessing}
                  sx={{
                    py: 1.5, borderRadius: 3, borderColor: "rgba(245, 158, 11, 0.3)", color: "#f59e0b",
                    "&:hover": { borderColor: "#f59e0b", bgcolor: "rgba(245, 158, 11, 0.04)" },
                  }}
                >
                  普通<Box component="span" sx={{ ml: 1, opacity: 0.7 }}><kbd>2</kbd></Box>
                </Button>
                <Button
                  variant="outlined" fullWidth onClick={() => handleRate("good")} disabled={isProcessing}
                  sx={{
                    py: 1.5, borderRadius: 3, borderColor: "rgba(16, 185, 129, 0.3)", color: "#10b981",
                    "&:hover": { borderColor: "#10b981", bgcolor: "rgba(16, 185, 129, 0.04)" },
                  }}
                >
                  簡単<Box component="span" sx={{ ml: 1, opacity: 0.7 }}><kbd>3</kbd></Box>
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
