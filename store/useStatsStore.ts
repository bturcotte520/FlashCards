import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Statistics, SessionStats } from '@/types';
import { getStatistics } from '@/lib/storage';
import { recordSession as recordSessionStats, updateStreak as updateStreakStats, setDailyGoal as setDailyGoalStats, getRetentionRate, getStreak, getDailyProgress, getDailyGoal, getStatisticsSummary, formatTimeSpent } from '@/lib/stats';

interface StatsState {
  stats: Statistics;
  isLoading: boolean;
  
  recordSession: (session: SessionStats) => void;
  updateStreak: () => void;
  setDailyGoal: (goal: number) => void;
  
  getRetentionRate: () => number;
  getStreak: () => number;
  getDailyProgress: () => number;
  getDailyGoal: () => number;
  getSummary: () => {
    totalCards: number;
    streak: number;
    retention: number;
    dailyProgress: number;
    dailyGoal: number;
  };
  formatTimeSpent: (seconds: number) => string;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      stats: getStatistics(),
      isLoading: false,
      
      recordSession: (session: SessionStats) => {
        recordSessionStats(session);
        set({ stats: getStatistics() });
      },
      
      updateStreak: () => {
        updateStreakStats();
        set({ stats: getStatistics() });
      },
      
      setDailyGoal: (goal: number) => {
        setDailyGoalStats(goal);
        set({ stats: getStatistics() });
      },
      
      getRetentionRate: () => getRetentionRate(),
      
      getStreak: () => getStreak(),
      
      getDailyProgress: () => getDailyProgress(),
      
      getDailyGoal: () => getDailyGoal(),
      
      getSummary: () => getStatisticsSummary(),
      
      formatTimeSpent: (seconds: number) => formatTimeSpent(seconds),
    }),
    {
      name: 'spanish-flashcards-stats-store',
      partialize: (state) => ({ stats: state.stats }),
    }
  )
);
