import axios from 'axios';
import { 
  XtreamCredentials, 
  UserInfo, 
  LiveCategory, 
  LiveStream, 
  MovieCategory, 
  Movie, 
  SeriesCategory, 
  Series, 
  Season, 
  Episode 
} from '@/types';

// Create axios instance for Xtream API
const createXtreamClient = (credentials: XtreamCredentials) => {
  const { server, username, password } = credentials;
  
  // Ensure server URL is properly formatted
  const baseURL = server.endsWith('/') ? server : `${server}/`;
  
  return axios.create({
    baseURL,
    params: {
      username,
      password
    }
  });
};

// Authentication
export const authenticate = async (credentials: XtreamCredentials): Promise<UserInfo> => {
  try {
    const client = createXtreamClient(credentials);
    const response = await client.get('player_api.php');
    
    if (response.data.user_info) {
      return response.data.user_info as UserInfo;
    }
    
    throw new Error('Authentication failed: Invalid response format');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
    throw error;
  }
};

// Live TV
export const getLiveCategories = async (credentials: XtreamCredentials): Promise<LiveCategory[]> => {
  try {
    const client = createXtreamClient(credentials);
    const response = await client.get('player_api.php', {
      params: {
        action: 'get_live_categories'
      }
    });
    
    return response.data as LiveCategory[];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch live categories: ${error.message}`);
    }
    throw error;
  }
};

export const getLiveStreams = async (
  credentials: XtreamCredentials, 
  categoryId?: string
): Promise<LiveStream[]> => {
  try {
    const client = createXtreamClient(credentials);
    const params: Record<string, string> = {
      action: 'get_live_streams'
    };
    
    if (categoryId) {
      params.category_id = categoryId;
    }
    
    const response = await client.get('player_api.php', { params });
    
    return response.data as LiveStream[];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch live streams: ${error.message}`);
    }
    throw error;
  }
};

export const getEPG = async (
  credentials: XtreamCredentials,
  streamId: number,
  limit?: number
) => {
  try {
    const client = createXtreamClient(credentials);
    const params: Record<string, string | number> = {
      action: 'get_short_epg',
      stream_id: streamId
    };
    
    if (limit) {
      params.limit = limit;
    }
    
    const response = await client.get('player_api.php', { params });
    
    return response.data.epg_listings;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch EPG: ${error.message}`);
    }
    throw error;
  }
};

// Movies (VOD)
export const getMovieCategories = async (credentials: XtreamCredentials): Promise<MovieCategory[]> => {
  try {
    const client = createXtreamClient(credentials);
    const response = await client.get('player_api.php', {
      params: {
        action: 'get_vod_categories'
      }
    });
    
    return response.data as MovieCategory[];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch movie categories: ${error.message}`);
    }
    throw error;
  }
};

export const getMovies = async (
  credentials: XtreamCredentials, 
  categoryId?: string
): Promise<Movie[]> => {
  try {
    const client = createXtreamClient(credentials);
    const params: Record<string, string> = {
      action: 'get_vod_streams'
    };
    
    if (categoryId) {
      params.category_id = categoryId;
    }
    
    const response = await client.get('player_api.php', { params });
    
    return response.data as Movie[];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch movies: ${error.message}`);
    }
    throw error;
  }
};

export const getMovieInfo = async (
  credentials: XtreamCredentials,
  movieId: number
): Promise<Movie> => {
  try {
    const client = createXtreamClient(credentials);
    const response = await client.get('player_api.php', {
      params: {
        action: 'get_vod_info',
        vod_id: movieId
      }
    });
    
    return response.data.info as Movie;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch movie info: ${error.message}`);
    }
    throw error;
  }
};

// Series
export const getSeriesCategories = async (credentials: XtreamCredentials): Promise<SeriesCategory[]> => {
  try {
    const client = createXtreamClient(credentials);
    const response = await client.get('player_api.php', {
      params: {
        action: 'get_series_categories'
      }
    });
    
    return response.data as SeriesCategory[];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch series categories: ${error.message}`);
    }
    throw error;
  }
};

export const getAllSeries = async (
  credentials: XtreamCredentials, 
  categoryId?: string
): Promise<Series[]> => {
  try {
    const client = createXtreamClient(credentials);
    const params: Record<string, string> = {
      action: 'get_series'
    };
    
    if (categoryId) {
      params.category_id = categoryId;
    }
    
    const response = await client.get('player_api.php', { params });
    
    return response.data as Series[];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch series: ${error.message}`);
    }
    throw error;
  }
};

export const getSeriesInfo = async (
  credentials: XtreamCredentials,
  seriesId: number
): Promise<{info: Series, episodes: Record<string, Episode[]>, seasons: Season[]}> => {
  try {
    const client = createXtreamClient(credentials);
    const response = await client.get('player_api.php', {
      params: {
        action: 'get_series_info',
        series_id: seriesId
      }
    });
    
    return {
      info: response.data.info as Series,
      episodes: response.data.episodes as Record<string, Episode[]>,
      seasons: response.data.seasons as Season[]
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch series info: ${error.message}`);
    }
    throw error;
  }
};

// Stream URL helpers
export const getLiveStreamUrl = (
  credentials: XtreamCredentials,
  streamId: number,
  extension: string = 'ts'
): string => {
  const { server, username, password } = credentials;
  const baseURL = server.endsWith('/') ? server.slice(0, -1) : server;
  
  return `${baseURL}/live/${username}/${password}/${streamId}.${extension}`;
};

export const getMovieUrl = (
  credentials: XtreamCredentials,
  streamId: number,
  extension: string = 'mp4'
): string => {
  const { server, username, password } = credentials;
  const baseURL = server.endsWith('/') ? server.slice(0, -1) : server;
  
  return `${baseURL}/movie/${username}/${password}/${streamId}.${extension}`;
};

export const getSeriesUrl = (
  credentials: XtreamCredentials,
  streamId: number,
  extension: string = 'mp4'
): string => {
  const { server, username, password } = credentials;
  const baseURL = server.endsWith('/') ? server.slice(0, -1) : server;
  
  return `${baseURL}/series/${username}/${password}/${streamId}.${extension}`;
};