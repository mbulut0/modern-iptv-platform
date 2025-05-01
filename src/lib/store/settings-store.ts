import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings } from '@/types';

interface SettingsStore extends AppSettings {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  setParentalControl: (enabled: boolean, pin?: string) => void;
  setPlayerSettings: (settings: Partial<AppSettings['player']>) => void;
  resetSettings: () => void;
}

const initialState: AppSettings = {
  theme: 'system',
  language: 'en',
  parentalControl: {
    enabled: false,
    pin: '0000'
  },
  player: {
    autoPlay: true,
    autoNext: true,
    defaultSubtitleLanguage: null,
    defaultAudioLanguage: null,
    bufferSize: 30
  }
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialState,
      
      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
      },
      
      setLanguage: (language: string) => {
        set({ language });
      },
      
      setParentalControl: (enabled: boolean, pin?: string) => {
        set((state) => ({
          parentalControl: {
            enabled,
            pin: pin || state.parentalControl.pin
          }
        }));
      },
      
      setPlayerSettings: (settings: Partial<AppSettings['player']>) => {
        set((state) => ({
          player: {
            ...state.player,
            ...settings
          }
        }));
      },
      
      resetSettings: () => {
        set(initialState);
      }
    }),
    {
      name: 'settings-storage'
    }
  )
);