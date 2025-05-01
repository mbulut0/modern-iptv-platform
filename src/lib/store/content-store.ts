import { create } from 'zustand';
import { 
  LiveCategory, 
  LiveStream, 
  MovieCategory, 
  Movie, 
  SeriesCategory, 
  Series,
  XtreamCredentials
} from '@/types';
import {
  getLiveCategories,
  getLiveStreams,
  getMovieCategories,
  getMovies,
  getSeriesCategories,
  getAllSeries
} from '@/lib/api/xtream';

interface ContentState {
  // Live TV
  liveCategories: LiveCategory[];
  liveStreams: Record<string, LiveStream[]>; // categoryId -> streams
  selectedLiveCategory: string | null;
  
  // Movies
  movieCategories: MovieCategory[];
  movies: Record<string, Movie[]>; // categoryId -> movies
  selectedMovieCategory: string | null;
  
  // Series
  seriesCategories: SeriesCategory[];
  series: Record<string, Series[]>; // categoryId -> series
  selectedSeriesCategory: string | null;
  
  // Loading states
  isLoadingLiveCategories: boolean;
  isLoadingLiveStreams: boolean;
  isLoadingMovieCategories: boolean;
  isLoadingMovies: boolean;
  isLoadingSeriesCategories: boolean;
  isLoadingSeries: boolean;
  
  // Errors
  error: string | null;
}

interface ContentActions {
  // Live TV actions
  fetchLiveCategories: (credentials: XtreamCredentials) => Promise<void>;
  fetchLiveStreams: (credentials: XtreamCredentials, categoryId?: string) => Promise<void>;
  setSelectedLiveCategory: (categoryId: string | null) => void;
  
  // Movies actions
  fetchMovieCategories: (credentials: XtreamCredentials) => Promise<void>;
  fetchMovies: (credentials: XtreamCredentials, categoryId?: string) => Promise<void>;
  setSelectedMovieCategory: (categoryId: string | null) => void;
  
  // Series actions
  fetchSeriesCategories: (credentials: XtreamCredentials) => Promise<void>;
  fetchSeries: (credentials: XtreamCredentials, categoryId?: string) => Promise<void>;
  setSelectedSeriesCategory: (categoryId: string | null) => void;
  
  // General actions
  clearError: () => void;
  resetContent: () => void;
}

type ContentStore = ContentState & ContentActions;

const initialState: ContentState = {
  // Live TV
  liveCategories: [],
  liveStreams: {},
  selectedLiveCategory: null,
  
  // Movies
  movieCategories: [],
  movies: {},
  selectedMovieCategory: null,
  
  // Series
  seriesCategories: [],
  series: {},
  selectedSeriesCategory: null,
  
  // Loading states
  isLoadingLiveCategories: false,
  isLoadingLiveStreams: false,
  isLoadingMovieCategories: false,
  isLoadingMovies: false,
  isLoadingSeriesCategories: false,
  isLoadingSeries: false,
  
  // Errors
  error: null
};

export const useContentStore = create<ContentStore>()((set, get) => ({
  ...initialState,
  
  // Live TV actions
  fetchLiveCategories: async (credentials: XtreamCredentials) => {
    try {
      set({ isLoadingLiveCategories: true, error: null });
      
      const categories = await getLiveCategories(credentials);
      
      set({
        liveCategories: categories,
        isLoadingLiveCategories: false
      });
    } catch (error) {
      set({
        isLoadingLiveCategories: false,
        error: error instanceof Error ? error.message : 'Failed to fetch live categories'
      });
      throw error;
    }
  },
  
  fetchLiveStreams: async (credentials: XtreamCredentials, categoryId?: string) => {
    try {
      set({ isLoadingLiveStreams: true, error: null });
      
      const streams = await getLiveStreams(credentials, categoryId);
      
      set((state) => ({
        liveStreams: {
          ...state.liveStreams,
          ...(categoryId ? { [categoryId]: streams } : { all: streams })
        },
        isLoadingLiveStreams: false
      }));
    } catch (error) {
      set({
        isLoadingLiveStreams: false,
        error: error instanceof Error ? error.message : 'Failed to fetch live streams'
      });
      throw error;
    }
  },
  
  setSelectedLiveCategory: (categoryId: string | null) => {
    set({ selectedLiveCategory: categoryId });
  },
  
  // Movies actions
  fetchMovieCategories: async (credentials: XtreamCredentials) => {
    try {
      set({ isLoadingMovieCategories: true, error: null });
      
      const categories = await getMovieCategories(credentials);
      
      set({
        movieCategories: categories,
        isLoadingMovieCategories: false
      });
    } catch (error) {
      set({
        isLoadingMovieCategories: false,
        error: error instanceof Error ? error.message : 'Failed to fetch movie categories'
      });
      throw error;
    }
  },
  
  fetchMovies: async (credentials: XtreamCredentials, categoryId?: string) => {
    try {
      set({ isLoadingMovies: true, error: null });
      
      const movies = await getMovies(credentials, categoryId);
      
      set((state) => ({
        movies: {
          ...state.movies,
          ...(categoryId ? { [categoryId]: movies } : { all: movies })
        },
        isLoadingMovies: false
      }));
    } catch (error) {
      set({
        isLoadingMovies: false,
        error: error instanceof Error ? error.message : 'Failed to fetch movies'
      });
      throw error;
    }
  },
  
  setSelectedMovieCategory: (categoryId: string | null) => {
    set({ selectedMovieCategory: categoryId });
  },
  
  // Series actions
  fetchSeriesCategories: async (credentials: XtreamCredentials) => {
    try {
      set({ isLoadingSeriesCategories: true, error: null });
      
      const categories = await getSeriesCategories(credentials);
      
      set({
        seriesCategories: categories,
        isLoadingSeriesCategories: false
      });
    } catch (error) {
      set({
        isLoadingSeriesCategories: false,
        error: error instanceof Error ? error.message : 'Failed to fetch series categories'
      });
      throw error;
    }
  },
  
  fetchSeries: async (credentials: XtreamCredentials, categoryId?: string) => {
    try {
      set({ isLoadingSeries: true, error: null });
      
      const series = await getAllSeries(credentials, categoryId);
      
      set((state) => ({
        series: {
          ...state.series,
          ...(categoryId ? { [categoryId]: series } : { all: series })
        },
        isLoadingSeries: false
      }));
    } catch (error) {
      set({
        isLoadingSeries: false,
        error: error instanceof Error ? error.message : 'Failed to fetch series'
      });
      throw error;
    }
  },
  
  setSelectedSeriesCategory: (categoryId: string | null) => {
    set({ selectedSeriesCategory: categoryId });
  },
  
  // General actions
  clearError: () => {
    set({ error: null });
  },
  
  resetContent: () => {
    set(initialState);
  }
}));