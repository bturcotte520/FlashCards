import { UserProgress, AnswerQuality, SRSResult } from '@/types';
import { SM2Parameters } from '@/types/srs';

const DEFAULT_PARAMS: SM2Parameters = {
  minEaseFactor: 1.3,
  defaultEaseFactor: 2.5,
  easyBonus: 1.3,
  intervalModifier: 1.0,
};

export function calculateNextReview(
  progress: UserProgress,
  quality: AnswerQuality,
  params: SM2Parameters = DEFAULT_PARAMS
): SRSResult {
  const { minEaseFactor, defaultEaseFactor, easyBonus, intervalModifier } = params;
  let { easeFactor = defaultEaseFactor, interval = 0, repetitions = 0 } = progress;

  // Calculate new ease factor
  // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const qualityAdjustment = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  easeFactor = easeFactor + qualityAdjustment;
  easeFactor = Math.max(minEaseFactor, easeFactor);

  if (quality < 3) {
    // Incorrect response - reset repetitions
    repetitions = 0;
    interval = 1;
  } else {
    // Correct response - calculate new interval
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor * intervalModifier);
    }
    repetitions++;
  }

  // Apply easy bonus for quality 5
  if (quality === 5) {
    interval = Math.round(interval * easyBonus);
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview,
  };
}

export function getInitialProgress(cardId: string): UserProgress {
  return {
    cardId,
    easeFactor: DEFAULT_PARAMS.defaultEaseFactor,
    interval: 0,
    repetitions: 0,
    nextReview: new Date(),
  };
}

export function isDue(progress: UserProgress): boolean {
  return new Date() >= new Date(progress.nextReview);
}

export function getNextReviewDate(interval: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + interval);
  return date;
}

export function formatInterval(days: number): string {
  if (days === 0) return 'Now';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.round(days / 7)} weeks`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
}

export function calculateRetentionRate(
  correctAnswers: number,
  totalAnswers: number
): number {
  if (totalAnswers === 0) return 0;
  return Math.round((correctAnswers / totalAnswers) * 100);
}

export function getRetentionGrade(rate: number): string {
  if (rate >= 90) return 'Excellent';
  if (rate >= 80) return 'Great';
  if (rate >= 70) return 'Good';
  if (rate >= 60) return 'Fair';
  return 'Needs Work';
}
