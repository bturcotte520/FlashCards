export interface SRSResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
}

export interface ReviewQuality {
  label: string;
  value: 0 | 1 | 2 | 3 | 4 | 5;
  color: string;
  description: string;
}

export const REVIEW_QUALITIES: ReviewQuality[] = [
  { label: 'Again', value: 0, color: 'bg-red-500', description: 'Complete blackout, no recall' },
  { label: 'Hard', value: 3, color: 'bg-yellow-500', description: 'Recalled with difficulty' },
  { label: 'Good', value: 4, color: 'bg-green-500', description: 'Recalled with some hesitation' },
  { label: 'Easy', value: 5, color: 'bg-blue-500', description: 'Perfect recall' },
];

export interface SM2Parameters {
  minEaseFactor: number;
  defaultEaseFactor: number;
  easyBonus: number;
  intervalModifier: number;
}
