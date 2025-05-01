import axios from 'axios';
import { TMDBMovie, TMDBSeries } from '@/types';

// TMDB API configuration
const TMDB_API_KEY = '42125c682636b68d10d70b487c692685';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjEyNWM2ODI2MzZiNjhkMTBkNzBiNDg3YzY5MjY4NSIsIm5iZiI6MS42NDM4MjA2NjA2OTUwMDAyZSs5LCJzdWIiOiI2MWZhYjY3NGI3YWJiNTAwNjY1YWQ4MzAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.e06dzH5trScMiz7obFbCFip5dO1XQp-bUC3lecJ8sxU';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Create axios instance for TMDB API
const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Image URL helper
export const getTMDBImageUrl = (path: string | null, size: string = 'w500'): string | null => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Search for a movie by title and year
export const searchMovie = async (title: string, year?: string): Promise<TMDBMovie[]> => {
  try {
    const params: Record<string, string> = {
      query: title,
      include_adult: 'false',
      language: 'en-US',
      page: '1'
    };
    
    if (year) {
      params.year = year;
    }
    
    const response = await tmdbClient.get('/search/movie', { params });
    
    return response.data.results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to search movie: ${error.message}`);
    }
    throw error;
  }
};

// Get detailed movie information including credits
export const getMovieDetails = async (movieId: number): Promise<TMDBMovie> => {
  try {
    const response = await tmdbClient.get(`/movie/${movieId}`, {
      params: {
        append_to_response: 'credits',
        language: 'en-US'
      }
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to get movie details: ${error.message}`);
    }
    throw error;
  }
};

// Get similar movies
export const getSimilarMovies = async (movieId: number): Promise<TMDBMovie[]> => {
  try {
    const response = await tmdbClient.get(`/movie/${movieId}/similar`, {
      params: {
        language: 'en-US',
        page: '1'
      }
    });
    
    return response.data.results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to get similar movies: ${error.message}`);
    }
    throw error;
  }
};

// Search for a TV series by name
export const searchTVSeries = async (name: string, firstAirDate?: string): Promise<TMDBSeries[]> => {
  try {
    const params: Record<string, string> = {
      query: name,
      include_adult: 'false',
      language: 'en-US',
      page: '1'
    };
    
    if (firstAirDate) {
      params.first_air_date_year = firstAirDate.split('-')[0];
    }
    
    const response = await tmdbClient.get('/search/tv', { params });
    
    return response.data.results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to search TV series: ${error.message}`);
    }
    throw error;
  }
};

// Get detailed TV series information including credits
export const getTVSeriesDetails = async (seriesId: number): Promise<TMDBSeries> => {
  try {
    const response = await tmdbClient.get(`/tv/${seriesId}`, {
      params: {
        append_to_response: 'credits',
        language: 'en-US'
      }
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to get TV series details: ${error.message}`);
    }
    throw error;
  }
};

// Get season details
export const getSeasonDetails = async (seriesId: number, seasonNumber: number) => {
  try {
    const response = await tmdbClient.get(`/tv/${seriesId}/season/${seasonNumber}`, {
      params: {
        language: 'en-US'
      }
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to get season details: ${error.message}`);
    }
    throw error;
  }
};

// Get similar TV series
export const getSimilarTVSeries = async (seriesId: number): Promise<TMDBSeries[]> => {
  try {
    const response = await tmdbClient.get(`/tv/${seriesId}/similar`, {
      params: {
        language: 'en-US',
        page: '1'
      }
    });
    
    return response.data.results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to get similar TV series: ${error.message}`);
    }
    throw error;
  }
};