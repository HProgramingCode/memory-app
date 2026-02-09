import { create } from "zustand";
import type { Deck } from "@/types";

interface DeckState {
  decks: Deck[];
  initialized: boolean;

  /** API からデッキ一覧を取得してストアを初期化 */
  fetchDecks: () => Promise<void>;
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

  fetchDecks: async () => {
    const res = await fetch("/api/decks");
    if (!res.ok) throw new Error("Failed to fetch decks");
    const decks: Deck[] = await res.json();
    set({ decks, initialized: true });
  },

  addDeck: async (name: string) => {
    const res = await fetch("/api/decks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to create deck");
    const newDeck: Deck = await res.json();
    set((state) => ({ decks: [...state.decks, newDeck] }));
    return newDeck;
  },

  updateDeck: async (id, name) => {
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
  },

  deleteDeck: async (id) => {
    const res = await fetch(`/api/decks/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete deck");
    set((state) => ({
      decks: state.decks.filter((d) => d.id !== id),
    }));
  },

  getDeck: (id) => {
    return get().decks.find((d) => d.id === id);
  },

  replaceAll: (decks) => {
    set({ decks });
  },
}));
