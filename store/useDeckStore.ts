import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Deck, Flashcard } from '@/types';
import { 
  getDecks as getDecksFromStorage, 
  saveDecks as saveDecksToStorage,
  getCards as getCardsFromStorage,
  saveCards as saveCardsToStorage,
  getDeckById,
  getCardsByIds
} from '@/lib/storage';

interface DeckState {
  decks: Deck[];
  currentDeck: Deck | null;
  isLoading: boolean;
  
  // Deck actions
  setDecks: (decks: Deck[]) => void;
  addDeck: (deck: Deck) => void;
  updateDeck: (id: string, updates: Partial<Deck>) => void;
  deleteDeck: (id: string) => void;
  setCurrentDeck: (deck: Deck | null) => void;
  
  // Card actions
  addCard: (deckId: string, card: Flashcard) => void;
  updateCard: (cardId: string, updates: Partial<Flashcard>) => void;
  deleteCard: (deckId: string, cardId: string) => void;
  
  // Computed
  getDecks: () => Deck[];
  getDeckById: (id: string) => Deck | undefined;
  getCardsForDeck: (deckId: string) => Flashcard[];
  getCardCount: (deckId: string) => number;
  getDueCardCount: (deckId: string) => number;
}

export const useDeckStore = create<DeckState>()(
  persist(
    (set, get) => ({
      decks: [],
      currentDeck: null,
      isLoading: false,
      
      setDecks: (decks: Deck[]) => {
        set({ decks });
        saveDecksToStorage(decks);
      },
      
      addDeck: (deck: Deck) => {
        const decks = [...get().decks, deck];
        set({ decks });
        saveDecksToStorage(decks);
      },
      
      updateDeck: (id: string, updates: Partial<Deck>) => {
        const decks = get().decks.map((deck: Deck) =>
          deck.id === id ? { ...deck, ...updates, updatedAt: new Date() } : deck
        );
        set({ decks });
        saveDecksToStorage(decks);
        
        // Update current deck if needed
        if (get().currentDeck?.id === id) {
          set({ currentDeck: { ...get().currentDeck!, ...updates, updatedAt: new Date() } });
        }
      },
      
      deleteDeck: (id: string) => {
        const decks = get().decks.filter((deck: Deck) => deck.id !== id);
        set({ decks, currentDeck: get().currentDeck?.id === id ? null : get().currentDeck });
        saveDecksToStorage(decks);
      },
      
      setCurrentDeck: (deck: Deck | null) => set({ currentDeck: deck }),
      
      addCard: (deckId: string, card: Flashcard) => {
        const decks = get().decks.map((deck: Deck) =>
          deck.id === deckId
            ? { ...deck, cards: [...deck.cards, card.id], updatedAt: new Date() }
            : deck
        );
        set({ decks });
        saveDecksToStorage(decks);
        
        // Save card
        const cards = [...getCardsFromStorage(), card];
        saveCardsToStorage(cards);
        
        // Update current deck if needed
        if (get().currentDeck?.id === deckId) {
          set({
            currentDeck: {
              ...get().currentDeck!,
              cards: [...get().currentDeck!.cards, card.id],
              updatedAt: new Date()
            }
          });
        }
      },
      
      updateCard: (cardId: string, updates: Partial<Flashcard>) => {
        const cards = getCardsFromStorage().map((card: Flashcard) =>
          card.id === cardId ? { ...card, ...updates, updatedAt: new Date() } : card
        );
        saveCardsToStorage(cards);
      },
      
      deleteCard: (deckId: string, cardId: string) => {
        const decks = get().decks.map((deck: Deck) =>
          deck.id === deckId
            ? { ...deck, cards: deck.cards.filter((id: string) => id !== cardId), updatedAt: new Date() }
            : deck
        );
        set({ decks });
        saveDecksToStorage(decks);
        
        // Delete card
        const cards = getCardsFromStorage().filter((card: Flashcard) => card.id !== cardId);
        saveCardsToStorage(cards);
        
        // Update current deck if needed
        if (get().currentDeck?.id === deckId) {
          set({
            currentDeck: {
              ...get().currentDeck!,
              cards: get().currentDeck!.cards.filter((id: string) => id !== cardId),
              updatedAt: new Date()
            }
          });
        }
      },
      
      getDecks: () => get().decks,
      
      getDeckById: (id: string) => getDeckById(id),
      
      getCardsForDeck: (deckId: string) => {
        const deck = getDeckById(deckId);
        if (!deck) return [];
        return getCardsByIds(deck.cards);
      },
      
      getCardCount: (deckId: string) => {
        const deck = getDeckById(deckId);
        return deck?.cards.length || 0;
      },
      
      getDueCardCount: (deckId: string) => {
        const cards = get().getCardsForDeck(deckId);
        const now = new Date();
        const { getProgress } = require('@/lib/storage');
        const progress = getProgress();
        
        return cards.filter((card: Flashcard) => {
          const cardProgress = progress[card.id];
          if (!cardProgress) return true;
          return new Date(cardProgress.nextReview) <= now;
        }).length;
      },
    }),
    {
      name: 'spanish-flashcards-deck-store',
      partialize: (state) => ({ decks: state.decks }),
    }
  )
);
