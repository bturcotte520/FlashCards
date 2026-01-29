// Core Flashcard Types
export interface Flashcard {
  id: string;
  front: string;           // Spanish word/phrase
  back: string;            // English translation
  type: 'vocabulary' | 'grammar' | 'verb' | 'sentence';
  pronunciation?: string;  // IPA or phonetic guide
  example?: string;        // Example sentence
  notes?: string;          // Additional notes
  difficulty: 1 | 2 | 3 | 4 | 5;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  cards: string[];         // Array of card IDs
  isPublic: boolean;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Spaced Repetition System Types
export interface UserProgress {
  cardId: string;
  easeFactor: number;      // SM-2 ease factor (2.5 default)
  interval: number;        // Days until next review
  repetitions: number;     // Number of successful reviews
  nextReview: Date;
  lastReview?: Date;
}

export interface SRSParams {
  MIN_EASE_FACTOR: 1.3;
  DEFAULT_EASE_FACTOR: 2.5;
  EASY_BONUS: 1.3;
  INTERVAL_MODIFIER: 1.0;
  NEW_CARD_LIMIT: 20;
  REVIEW_CARD_LIMIT: 50;
}

// Statistics Types
export interface SessionStats {
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;       // Seconds
  streak: number;
  retentionRate: number;
}

export interface DailyActivity {
  date: string;
  cardsStudied: number;
  correctAnswers: number;
  timeSpent: number;
}

export interface Statistics {
  totalCardsLearned: number;
  totalTimeSpent: number;  // Seconds
  currentStreak: number;   // Days
  longestStreak: number;
  retentionRate: number;   // Percentage
  dailyGoal: number;       // Cards per day
  dailyProgress: number;
  weeklyActivity: DailyActivity[];
}

export interface MasteryLevel {
  level: number;
  cardsRequired: number;
  title: string;
  icon: string;
}

// User Settings
export interface UserSettings {
  dailyGoal: number;
  autoPlayAudio: boolean;
  showPronunciation: boolean;
  darkMode: boolean;
  notifications: boolean;
  language: string;
}

// Import/Export Types
export interface DeckExport {
  version: string;
  exportedAt: string;
  deck: Deck;
  cards: Flashcard[];
  progress?: Record<string, UserProgress>;
}

// Study Session Types
export interface StudySession {
  deckId: string;
  cards: string[];
  currentIndex: number;
  isFlipped: boolean;
  startTime: Date;
  correctCount: number;
  incorrectCount: number;
}

export type AnswerQuality = 0 | 1 | 2 | 3 | 4 | 5;
