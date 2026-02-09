import { create } from "zustand";
import type { Card, ReviewRating } from "@/types";
import { getTodayString, isDueToday } from "@/lib/srs";
import { deleteImage } from "@/lib/imageDb";
import { toast } from "react-hot-toast";

interface CardState {
  cards: Card[];
  initialized: boolean;

  /** API からカード一覧を取得してストアを初期化 */
  fetchCards: () => Promise<void>;

  addCard: (params: {
    deckId: string;
    frontText: string;
    backText: string;
    frontImageId: string | null;
    backImageId: string | null;
  }) => Promise<Card>;

  updateCard: (
    id: string,
    params: {
      frontText?: string;
      backText?: string;
      frontImageId?: string | null;
      backImageId?: string | null;
      deckId?: string;
    }
  ) => Promise<void>;

  deleteCard: (id: string) => Promise<void>;

  /** デッキに属する全カードを削除（API側はDeck cascadeで処理済み） */
  deleteCardsByDeckId: (deckId: string) => void;

  getCard: (id: string) => Card | undefined;
  getCardsByDeckId: (deckId: string) => Card[];
  getDueCards: () => Card[];
  getDueCardsByDeckId: (deckId: string) => Card[];

  /** 復習結果を反映 */
  applyReview: (cardId: string, rating: ReviewRating) => Promise<void>;

  /** テキストでカードを検索 */
  searchCards: (query: string) => Card[];

  /** インポート用: ストアのデータを直接置換 */
  replaceAll: (cards: Card[]) => void;
}

export const useCardStore = create<CardState>()((set, get) => ({
  cards: [],
  initialized: false,

  fetchCards: async () => {
    const res = await fetch("/api/cards");
    if (!res.ok) throw new Error("Failed to fetch cards");
    const cards: Card[] = await res.json();
    set({ cards, initialized: true });
  },

  addCard: async (params) => {
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to create card");
      const newCard: Card = await res.json();
      set((state) => ({ cards: [...state.cards, newCard] }));
      toast.success("カードを作成しました");
      return newCard;
    } catch (error) {
      toast.error("カードの作成に失敗しました");
      throw error;
    }
  },

  updateCard: async (id, params) => {
    try {
      const res = await fetch(`/api/cards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to update card");
      const updated: Card = await res.json();
      set((state) => ({
        cards: state.cards.map((c) => (c.id === id ? updated : c)),
      }));
      toast.success("カードを更新しました");
    } catch (error) {
      toast.error("カードの更新に失敗しました");
      throw error;
    }
  },

  deleteCard: async (id) => {
    try {
      const card = get().cards.find((c) => c.id === id);
      if (card) {
        if (card.frontImageId) deleteImage(card.frontImageId);
        if (card.backImageId) deleteImage(card.backImageId);
      }
      const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete card");
      set((state) => ({
        cards: state.cards.filter((c) => c.id !== id),
      }));
      toast.success("カードを削除しました");
    } catch (error) {
      toast.error("カードの削除に失敗しました");
      throw error;
    }
  },

  deleteCardsByDeckId: (deckId) => {
    const cardsToDelete = get().cards.filter((c) => c.deckId === deckId);
    cardsToDelete.forEach((card) => {
      if (card.frontImageId) deleteImage(card.frontImageId);
      if (card.backImageId) deleteImage(card.backImageId);
    });
    set((state) => ({
      cards: state.cards.filter((c) => c.deckId !== deckId),
    }));
  },

  getCard: (id) => {
    return get().cards.find((c) => c.id === id);
  },

  getCardsByDeckId: (deckId) => {
    return get().cards.filter((c) => c.deckId === deckId);
  },

  getDueCards: () => {
    const today = getTodayString();
    return get().cards.filter((c) => c.nextReviewDate <= today);
  },

  getDueCardsByDeckId: (deckId) => {
    const today = getTodayString();
    return get().cards.filter(
      (c) => c.deckId === deckId && c.nextReviewDate <= today
    );
  },

  applyReview: async (cardId, rating) => {
    try {
      const res = await fetch(`/api/cards/${cardId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      if (!res.ok) throw new Error("Failed to apply review");
      const updated: Card = await res.json();
      set((state) => ({
        cards: state.cards.map((c) => (c.id === cardId ? updated : c)),
      }));
    } catch (error) {
      toast.error("復習の記録に失敗しました");
      throw error;
    }
  },

  searchCards: (query) => {
    const lower = query.toLowerCase();
    return get().cards.filter(
      (c) =>
        c.frontText.toLowerCase().includes(lower) ||
        c.backText.toLowerCase().includes(lower)
    );
  },

  replaceAll: (cards) => {
    set({ cards });
  },
}));
