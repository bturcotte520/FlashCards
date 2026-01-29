import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSettings } from '@/types';
import { getSettings as getSettingsFromStorage, saveSettings as saveSettingsToStorage } from '@/lib/storage';

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetSettings: () => void;
  toggleDarkMode: () => void;
  setDailyGoal: (goal: number) => void;
  toggleAutoPlayAudio: () => void;
  
  getSettings: () => UserSettings;
  isDarkMode: () => boolean;
  getDailyGoal: () => number;
}

const defaultSettings: UserSettings = {
  dailyGoal: 20,
  autoPlayAudio: false,
  showPronunciation: true,
  darkMode: false,
  notifications: true,
  language: 'en',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: getSettingsFromStorage(),
      isLoading: false,
      
      updateSettings: (updates: Partial<UserSettings>) => {
        const newSettings = { ...get().settings, ...updates };
        set({ settings: newSettings });
        saveSettingsToStorage(newSettings);
      },
      
      resetSettings: () => {
        set({ settings: defaultSettings });
        saveSettingsToStorage(defaultSettings);
      },
      
      toggleDarkMode: () => {
        const newDarkMode = !get().settings.darkMode;
        get().updateSettings({ darkMode: newDarkMode });
      },
      
      setDailyGoal: (goal: number) => {
        get().updateSettings({ dailyGoal: Math.max(1, Math.min(100, goal)) });
      },
      
      toggleAutoPlayAudio: () => {
        get().updateSettings({ autoPlayAudio: !get().settings.autoPlayAudio });
      },
      
      getSettings: () => get().settings,
      
      isDarkMode: () => get().settings.darkMode,
      
      getDailyGoal: () => get().settings.dailyGoal,
    }),
    {
      name: 'spanish-flashcards-settings-store',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
