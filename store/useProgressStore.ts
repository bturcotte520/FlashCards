import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProgress, Flashcard } from '@/types';
import { getProgress, updateCardProgress } from '@/lib/storage';
import { calculateNextReview, getInitialProgress } from '@/lib/srs';

interface ProgressState {
  progress: Record<string, UserProgress>;
  isLoading: boolean;
  
  // Actions
  initializeCardProgress: (cardId: string) => UserProgress;
  getCardProgress: (cardId: string) => UserProgress | undefined;
  updateCardProgress: (cardId: string, quality: 0 | 1 | 2 | 3 | 4 | 5) => UserProgress;
  markCardForReview: (cardId: string) => void;
  
  // Computed
  getDueCards: (deckId: string, cards: Flashcard[]) => Flashcard[];
  getDueCardCount: (deckId: string, cards: Flashcard[]) => number;
  getNewCards: (deckId: string, cards: Flashcard[]) => Flashcard[];
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},
      isLoading: false,
      
      initializeCardProgress: (cardId: string) => {
        const existing = get().progress[cardId];
        if (existing) return existing;
        
        const newProgress = getInitialProgress(cardId);
        set(state => ({
          progress: { ...state.progress, [cardId]: newProgress }
        }));
        updateCardProgress(cardId, newProgress);
        return newProgress;
      },
      
      getCardProgress: (cardId: string) => {
        return get().progress[cardId] || get().initializeCardProgress(cardId);
      },
      
      updateCardProgress: (cardId: string, quality: 0 | 1 | 2 | 3 | 4 | 5) => {
        const currentProgress = get().getCardProgress(cardId);
        if (!currentProgress) {
          return get().initializeCardProgress(cardId);
        }
        const result = calculateNextReview(currentProgress, quality);
        
        const updatedProgress: UserProgress = {
          cardId,
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
          nextReview: result.nextReview,
          lastReview: new Date(),
        };
        
        set(state => ({
          progress: { ...state.progress, [cardId]: updatedProgress }
        }));
        updateCardProgress(cardId, updatedProgress);
        
        return updatedProgress;
      },
      
      markCardForReview: (cardId: string) => {
        let currentProgress = get().getCardProgress(cardId);
        if (!currentProgress) {
          currentProgress = get().initializeCardProgress(cardId);
        }
        const updatedProgress: UserProgress = {
          cardId: currentProgress.cardId,
          easeFactor: currentProgress.easeFactor,
          repetitions: 0,
          interval: 0,
          nextReview: new Date(),
          lastReview: currentProgress.lastReview,
        };
        
        set(state => ({
          progress: { ...state.progress, [cardId]: updatedProgress }
        }));
        updateCardProgress(cardId, updatedProgress);
      },
      
      getDueCards: (_deckId: string, cards: Flashcard[]) => {
        const now = new Date();
        const progress = get().progress;
        
        return cards.filter((card: Flashcard) => {
          const cardProgress = progress[card.id];
          if (!cardProgress) return true;
          return new Date(cardProgress.nextReview) <= now;
        });
      },
      
      getDueCardCount: (_deckId: string, cards: Flashcard[]) => {
        return get().getDueCards(_deckId, cards).length;
      },
      
      getNewCards: (_deckId: string, cards: Flashcard[]) => {
        const progress = get().progress;
        
        return cards.filter((card: Flashcard) => !progress[card.id]);
      },
    }),
    {
      name: 'spanish-flashcards-progress-store',
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);
