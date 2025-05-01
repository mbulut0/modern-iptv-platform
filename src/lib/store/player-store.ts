import { create } from 'zustand';
import { PlayerState, Subtitle, AudioTrack } from '@/types';

interface PlayerStore extends PlayerState {
  setSource: (source: string, title: string, type: 'live' | 'movie' | 'series') => void;
  setPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (isMuted: boolean) => void;
  setFullscreen: (isFullscreen: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setQuality: (quality: string) => void;
  setSubtitles: (subtitles: Subtitle[]) => void;
  setSelectedSubtitle: (id: string | null) => void;
  setAudioTracks: (tracks: AudioTrack[]) => void;
  setSelectedAudioTrack: (id: string | null) => void;
  resetPlayer: () => void;
}

const initialState: PlayerState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  isFullscreen: false,
  playbackRate: 1,
  quality: 'auto',
  source: '',
  title: '',
  type: 'live',
  subtitles: [],
  selectedSubtitle: null,
  audioTracks: [],
  selectedAudioTrack: null
};

export const usePlayerStore = create<PlayerStore>()((set) => ({
  ...initialState,
  
  setSource: (source: string, title: string, type: 'live' | 'movie' | 'series') => {
    set({
      source,
      title,
      type,
      isPlaying: true,
      currentTime: 0,
      duration: 0
    });
  },
  
  setPlaying: (isPlaying: boolean) => {
    set({ isPlaying });
  },
  
  setCurrentTime: (currentTime: number) => {
    set({ currentTime });
  },
  
  setDuration: (duration: number) => {
    set({ duration });
  },
  
  setVolume: (volume: number) => {
    set({ volume });
  },
  
  setMuted: (isMuted: boolean) => {
    set({ isMuted });
  },
  
  setFullscreen: (isFullscreen: boolean) => {
    set({ isFullscreen });
  },
  
  setPlaybackRate: (playbackRate: number) => {
    set({ playbackRate });
  },
  
  setQuality: (quality: string) => {
    set({ quality });
  },
  
  setSubtitles: (subtitles: Subtitle[]) => {
    set({ subtitles });
  },
  
  setSelectedSubtitle: (selectedSubtitle: string | null) => {
    set({ selectedSubtitle });
  },
  
  setAudioTracks: (audioTracks: AudioTrack[]) => {
    set({ audioTracks });
  },
  
  setSelectedAudioTrack: (selectedAudioTrack: string | null) => {
    set({ selectedAudioTrack });
  },
  
  resetPlayer: () => {
    set(initialState);
  }
}));