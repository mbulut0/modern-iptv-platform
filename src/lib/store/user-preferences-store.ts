import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserPreferences } from '@/types';

interface UserPreferencesStore extends UserPreferences {
  // Favorites
  addFavoriteChannel: (channelId: number) => void;
  removeFavoriteChannel: (channelId: number) => void;
  addFavoriteMovie: (movieId: number) => void;
  removeFavoriteMovie: (movieId: number) => void;
  addFavoriteSeries: (seriesId: number) => void;
  removeFavoriteSeries: (seriesId: number) => void;
  
  // Watch history
  updateChannelHistory: (channelId: number) => void;
  updateMovieHistory: (movieId: number, progress: number) => void;
  updateSeriesHistory: (seriesId: number, season: number, episode: number, progress: number) => void;
  
  // General
  clearHistory: () => void;
  clearFavorites: () => void;
  resetPreferences: () => void;
}

const initialState: UserPreferences = {
  favorites: {
    channels: [],
    movies: [],
    series: []
  },
  watchHistory: {
    channels: [],
    movies: [],
    series: []
  }
};

export const useUserPreferencesStore = create<UserPreferencesStore>()(
  persist(
    (set) => ({
      ...initialState,
      
      // Favorites
      addFavoriteChannel: (channelId: number) => {
        set((state) => ({
          favorites: {
            ...state.favorites,
            channels: state.favorites.channels.includes(channelId)
              ? state.favorites.channels
              : [...state.favorites.channels, channelId]
          }
        }));
      },
      
      removeFavoriteChannel: (channelId: number) => {
        set((state) => ({
          favorites: {
            ...state.favorites,
            channels: state.favorites.channels.filter(id => id !== channelId)
          }
        }));
      },
      
      addFavoriteMovie: (movieId: number) => {
        set((state) => ({
          favorites: {
            ...state.favorites,
            movies: state.favorites.movies.includes(movieId)
              ? state.favorites.movies
              : [...state.favorites.movies, movieId]
          }
        }));
      },
      
      removeFavoriteMovie: (movieId: number) => {
        set((state) => ({
          favorites: {
            ...state.favorites,
            movies: state.favorites.movies.filter(id => id !== movieId)
          }
        }));
      },
      
      addFavoriteSeries: (seriesId: number) => {
        set((state) => ({
          favorites: {
            ...state.favorites,
            series: state.favorites.series.includes(seriesId)
              ? state.favorites.series
              : [...state.favorites.series, seriesId]
          }
        }));
      },
      
      removeFavoriteSeries: (seriesId: number) => {
        set((state) => ({
          favorites: {
            ...state.favorites,
            series: state.favorites.series.filter(id => id !== seriesId)
          }
        }));
      },
      
      // Watch history
      updateChannelHistory: (channelId: number) => {
        set((state) => {
          const now = new Date().toISOString();
          const existingIndex = state.watchHistory.channels.findIndex(ch => ch.id === channelId);
          
          const updatedChannels = existingIndex >= 0
            ? [
                ...state.watchHistory.channels.slice(0, existingIndex),
                { id: channelId, lastWatched: now },
                ...state.watchHistory.channels.slice(existingIndex + 1)
              ]
            : [
                { id: channelId, lastWatched: now },
                ...state.watchHistory.channels
              ];
          
          // Keep only the most recent 50 channels
          const limitedChannels = updatedChannels.slice(0, 50);
          
          return {
            watchHistory: {
              ...state.watchHistory,
              channels: limitedChannels
            }
          };
        });
      },
      
      updateMovieHistory: (movieId: number, progress: number) => {
        set((state) => {
          const now = new Date().toISOString();
          const existingIndex = state.watchHistory.movies.findIndex(m => m.id === movieId);
          
          const updatedMovies = existingIndex >= 0
            ? [
                ...state.watchHistory.movies.slice(0, existingIndex),
                { id: movieId, progress, lastWatched: now },
                ...state.watchHistory.movies.slice(existingIndex + 1)
              ]
            : [
                { id: movieId, progress, lastWatched: now },
                ...state.watchHistory.movies
              ];
          
          // Keep only the most recent 50 movies
          const limitedMovies = updatedMovies.slice(0, 50);
          
          return {
            watchHistory: {
              ...state.watchHistory,
              movies: limitedMovies
            }
          };
        });
      },
      
      updateSeriesHistory: (seriesId: number, season: number, episode: number, progress: number) => {
        set((state) => {
          const now = new Date().toISOString();
          const existingIndex = state.watchHistory.series.findIndex(s => 
            s.id === seriesId && s.season === season && s.episode === episode
          );
          
          let updatedSeries;
          
          if (existingIndex >= 0) {
            updatedSeries = [
              ...state.watchHistory.series.slice(0, existingIndex),
              { id: seriesId, season, episode, progress, lastWatched: now },
              ...state.watchHistory.series.slice(existingIndex + 1)
            ];
          } else {
            // Check if we have any entry for this series
            const seriesIndex = state.watchHistory.series.findIndex(s => s.id === seriesId);
            
            if (seriesIndex >= 0) {
              // If we have an entry for this series but different episode, update only if newer
              const existingEpisode = state.watchHistory.series[seriesIndex];
              
              if (
                season > existingEpisode.season || 
                (season === existingEpisode.season && episode > existingEpisode.episode)
              ) {
                updatedSeries = [
                  ...state.watchHistory.series.slice(0, seriesIndex),
                  { id: seriesId, season, episode, progress, lastWatched: now },
                  ...state.watchHistory.series.slice(seriesIndex + 1)
                ];
              } else {
                // Keep existing if it's a newer episode
                updatedSeries = state.watchHistory.series;
              }
            } else {
              // New series entry
              updatedSeries = [
                { id: seriesId, season, episode, progress, lastWatched: now },
                ...state.watchHistory.series
              ];
            }
          }
          
          // Keep only the most recent 50 series
          const limitedSeries = updatedSeries.slice(0, 50);
          
          return {
            watchHistory: {
              ...state.watchHistory,
              series: limitedSeries
            }
          };
        });
      },
      
      // General
      clearHistory: () => {
        set((state) => ({
          watchHistory: {
            channels: [],
            movies: [],
            series: []
          }
        }));
      },
      
      clearFavorites: () => {
        set((state) => ({
          favorites: {
            channels: [],
            movies: [],
            series: []
          }
        }));
      },
      
      resetPreferences: () => {
        set(initialState);
      }
    }),
    {
      name: 'user-preferences-storage'
    }
  )
);