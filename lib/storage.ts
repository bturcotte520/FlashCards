import { Flashcard, Deck, UserProgress, Statistics, UserSettings } from '@/types';

const STORAGE_KEYS = {
  DECKS: 'spanish-flashcards-decks',
  CARDS: 'spanish-flashcards-cards',
  PROGRESS: 'spanish-flashcards-progress',
  STATS: 'spanish-flashcards-stats',
  SETTINGS: 'spanish-flashcards-settings',
  LAST_ACTIVE: 'spanish-flashcards-last-active',
};

// Deck Storage
export function saveDecks(decks: Deck[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
  }
}

export function getDecks(): Deck[] {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(STORAGE_KEYS.DECKS);
  if (!data) return [];
  
  try {
    return JSON.parse(data, (key: string, value: unknown) => {
      if (key === 'createdAt' || key === 'updatedAt' || key === 'nextReview') {
        return new Date(value as string);
      }
      return value;
    });
  } catch {
    return [];
  }
}

export function getDeckById(id: string): Deck | undefined {
  const decks = getDecks();
  return decks.find(deck => deck.id === id);
}

// Card Storage
export function saveCards(cards: Flashcard[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  }
}

export function getCards(): Flashcard[] {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(STORAGE_KEYS.CARDS);
  if (!data) return [];
  
  try {
    return JSON.parse(data, (key: string, value: unknown) => {
      if (key === 'createdAt' || key === 'updatedAt') {
        return new Date(value as string);
      }
      return value;
    });
  } catch {
    return [];
  }
}

export function getCardById(id: string): Flashcard | undefined {
  const cards = getCards();
  return cards.find(card => card.id === id);
}

export function getCardsByIds(ids: string[]): Flashcard[] {
  const cards = getCards();
  return cards.filter(card => ids.includes(card.id));
}

export function saveCard(card: Flashcard): void {
  const cards = getCards();
  const index = cards.findIndex(c => c.id === card.id);
  
  if (index >= 0) {
    cards[index] = card;
  } else {
    cards.push(card);
  }
  
  saveCards(cards);
}

export function deleteCard(id: string): void {
  const cards = getCards().filter(card => card.id !== id);
  saveCards(cards);
}

// Progress Storage
export function saveProgress(progress: Record<string, UserProgress>): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  }
}

export function getProgress(): Record<string, UserProgress> {
  if (typeof window === 'undefined') return {};
  
  const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
  if (!data) return {};
  
  try {
    return JSON.parse(data, (key: string, value: unknown) => {
      if (key === 'nextReview' || key === 'lastReview') {
        return new Date(value as string);
      }
      return value;
    });
  } catch {
    return {};
  }
}

export function getCardProgress(cardId: string): UserProgress | undefined {
  const progress = getProgress();
  return progress[cardId];
}

export function updateCardProgress(cardId: string, cardProgress: UserProgress): void {
  const progress = getProgress();
  progress[cardId] = cardProgress;
  saveProgress(progress);
}

// Statistics Storage
export function saveStatistics(stats: Statistics): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }
}

export function getStatistics(): Statistics {
  if (typeof window === 'undefined') {
    return getDefaultStatistics();
  }
  
  const data = localStorage.getItem(STORAGE_KEYS.STATS);
  if (!data) return getDefaultStatistics();
  
  try {
    return JSON.parse(data, (key: string, value: unknown) => {
      if (key === 'date') return value;
      return value;
    });
  } catch {
    return getDefaultStatistics();
  }
}

function getDefaultStatistics(): Statistics {
  return {
    totalCardsLearned: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    longestStreak: 0,
    retentionRate: 0,
    dailyGoal: 20,
    dailyProgress: 0,
    weeklyActivity: [],
  };
}

// Settings Storage
export function saveSettings(settings: UserSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
}

export function getSettings(): UserSettings {
  if (typeof window === 'undefined') {
    return getDefaultSettings();
  }
  
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!data) return getDefaultSettings();
  
  try {
    return JSON.parse(data);
  } catch {
    return getDefaultSettings();
  }
}

function getDefaultSettings(): UserSettings {
  return {
    dailyGoal: 20,
    autoPlayAudio: false,
    showPronunciation: true,
    darkMode: false,
    notifications: true,
    language: 'en',
  };
}

// Last Active Date
export function saveLastActive(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, new Date().toISOString());
  }
}

export function getLastActive(): Date | null {
  if (typeof window === 'undefined') return null;
  
  const data = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE);
  if (!data) return null;
  
  return new Date(data);
}

// Utility Functions
export function clearAllData(): void {
  if (typeof window !== 'undefined') {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export function exportAllData(): string {
  const data = {
    decks: getDecks(),
    cards: getCards(),
    progress: getProgress(),
    statistics: getStatistics(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  };
  
  return JSON.stringify(data, null, 2);
}

export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.decks) saveDecks(data.decks);
    if (data.cards) saveCards(data.cards);
    if (data.progress) saveProgress(data.progress);
    if (data.statistics) saveStatistics(data.statistics);
    if (data.settings) saveSettings(data.settings);
    
    return true;
  } catch {
    return false;
  }
}
