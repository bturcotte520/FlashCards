import { Statistics, DailyActivity, SessionStats } from '@/types';
import { getStatistics, saveStatistics, getLastActive, saveLastActive } from './storage';

export function updateDailyProgress(cardsStudied: number): void {
  const stats = getStatistics();
  const today = new Date().toISOString().split('T')[0];
  
  // Find or create today's activity
  let todayActivity = stats.weeklyActivity.find((a: DailyActivity) => a.date === today);
  
  if (!todayActivity) {
    todayActivity = {
      date: today,
      cardsStudied: 0,
      correctAnswers: 0,
      timeSpent: 0,
    };
    stats.weeklyActivity.push(todayActivity);
    
    // Keep only last 7 days
    stats.weeklyActivity = stats.weeklyActivity.slice(-7);
  }
  
  todayActivity.cardsStudied += cardsStudied;
  stats.dailyProgress = todayActivity.cardsStudied;
  
  // Update streak
  updateStreak();
  
  // Save statistics
  saveStatistics(stats);
  saveLastActive();
}

export function recordSession(session: SessionStats): void {
  const stats = getStatistics();
  
  // Update totals
  stats.totalCardsLearned += session.cardsStudied;
  stats.totalTimeSpent += session.timeSpent;
  
  // Update retention rate
  const totalAnswers = session.correctAnswers + session.incorrectAnswers;
  if (totalAnswers > 0) {
    const currentRate = stats.retentionRate;
    const newRate = (session.correctAnswers / totalAnswers) * 100;
    
    // Smooth the retention rate
    stats.retentionRate = Math.round((currentRate * 0.7) + (newRate * 0.3));
  }
  
  // Update daily progress
  updateDailyProgress(session.cardsStudied);
  
  saveStatistics(stats);
}

export function updateStreak(): void {
  const stats = getStatistics();
  const lastActive = getLastActive();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!lastActive) {
    stats.currentStreak = 1;
    return;
  }
  
  const lastDate = new Date(lastActive);
  lastDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (diffDays === 0) {
    // Same day, no change
    return;
  } else if (diffDays === 1) {
    // Consecutive day, increment streak
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
  } else {
    // Streak broken
    stats.currentStreak = 1;
  }
  
  saveStatistics(stats);
}

export function getRetentionRate(): number {
  const stats = getStatistics();
  return stats.retentionRate;
}

export function getStreak(): number {
  const stats = getStatistics();
  return stats.currentStreak;
}

export function getDailyProgress(): number {
  const stats = getStatistics();
  return stats.dailyProgress;
}

export function getDailyGoal(): number {
  const stats = getStatistics();
  return stats.dailyGoal;
}

export function setDailyGoal(goal: number): void {
  const stats = getStatistics();
  stats.dailyGoal = Math.max(1, Math.min(100, goal));
  saveStatistics(stats);
}

export function getWeeklyActivity(): DailyActivity[] {
  const stats = getStatistics();
  return stats.weeklyActivity;
}

export function getStatisticsSummary(): {
  totalCards: number;
  streak: number;
  retention: number;
  dailyProgress: number;
  dailyGoal: number;
} {
  const stats = getStatistics();
  return {
    totalCards: stats.totalCardsLearned,
    streak: stats.currentStreak,
    retention: stats.retentionRate,
    dailyProgress: stats.dailyProgress,
    dailyGoal: stats.dailyGoal,
  };
}

export function calculateMasteryLevel(cardsLearned: number): {
  level: number;
  title: string;
  progress: number;
} {
  if (cardsLearned < 10) {
    return { level: 1, title: 'Novice', progress: (cardsLearned / 10) * 100 };
  } else if (cardsLearned < 50) {
    return { level: 2, title: 'Beginner', progress: ((cardsLearned - 10) / 40) * 100 };
  } else if (cardsLearned < 100) {
    return { level: 3, title: 'Learner', progress: ((cardsLearned - 50) / 50) * 100 };
  } else if (cardsLearned < 250) {
    return { level: 4, title: 'Speaker', progress: ((cardsLearned - 100) / 150) * 100 };
  } else if (cardsLearned < 500) {
    return { level: 5, title: 'Conversationalist', progress: ((cardsLearned - 250) / 250) * 100 };
  } else {
    return { level: 6, title: 'Fluent', progress: 100 };
  }
}

export function formatTimeSpent(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}
