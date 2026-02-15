import { create } from "zustand";
import type { Deck } from "@/types";
import { toast } from "react-hot-toast";

interface DeckState {
  decks: Deck[];
  initialized: boolean;

  /** API からデッキ一覧を取得してストアを初期化 */
  setDecks: (decks: Deck[]) => void;
  addDeck: (name: string) => Promise<Deck>;
  updateDeck: (id: string, name: string) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  getDeck: (id: string) => Deck | undefined;
  /** インポート用: API経由で全データ置換後にストアをリフレッシュ */
  replaceAll: (decks: Deck[]) => void;
}

export const useDeckStore = create<DeckState>()((set, get) => ({
  decks: [],
  initialized: false,

  setDecks: (decks: Deck[]) => {
    set({ decks, initialized: true });
  },

  addDeck: async (name: string) => {
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create deck");
      const newDeck: Deck = await res.json();
      set((state) => ({ decks: [...state.decks, newDeck] }));
      toast.success("デッキを作成しました");
      return newDeck;
    } catch (error) {
      toast.error("デッキの作成に失敗しました");
      throw error;
    }
  },

  updateDeck: async (id, name) => {
    try {
      const res = await fetch(`/api/decks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to update deck");
      const updated: Deck = await res.json();
      set((state) => ({
        decks: state.decks.map((d) => (d.id === id ? updated : d)),
      }));
      toast.success("デッキ名を更新しました");
    } catch (error) {
      toast.error("デッキ名の更新に失敗しました");
      throw error;
    }
  },

  deleteDeck: async (id) => {
    try {
      const res = await fetch(`/api/decks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete deck");
      set((state) => ({
        decks: state.decks.filter((d) => d.id !== id),
      }));
      toast.success("デッキを削除しました");
    } catch (error) {
      toast.error("デッキの削除に失敗しました");
      throw error;
    }
  },

  getDeck: (id) => {
    return get().decks.find((d) => d.id === id);
  },

  replaceAll: (decks) => {
    set({ decks });
  },
}));
