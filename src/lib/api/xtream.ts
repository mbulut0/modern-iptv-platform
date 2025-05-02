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

// Authentication using our proxy API
export const authenticate = async (credentials: XtreamCredentials): Promise<UserInfo> => {
  try {
    console.log('Authenticating with credentials:', credentials);
    
    // Use our proxy API instead of direct request
    const response = await axios.post('/api/xtream', {
      server: credentials.server,
      username: credentials.username,
      password: credentials.password
    });
    
    console.log('Auth response status:', response.status);
    console.log('Auth response data type:', typeof response.data);
    
    // Validate response
    if (!response.data) {
      throw new Error('Authentication failed: Empty response from server');
    }
    
    // Log the response structure
    console.log('Response keys:', Object.keys(response.data));
    
    if (response.data && response.data.user_info) {
      const userInfo = response.data.user_info as UserInfo;
      console.log('User info extracted:', {
        username: userInfo.username,
        status: userInfo.status,
        exp_date: userInfo.exp_date,
        active_cons: userInfo.active_cons
      });
      return userInfo;
    }
    
    // If we get here, the response format is invalid
    console.error('Invalid response format:', response.data);
    throw new Error('Authentication failed: Invalid response format');
  } catch (error) {
    console.error('Authentication error details:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
      
      throw new Error(`Authentication failed: ${error.message}`);
    }
    
    throw error;
  }
};

// Live TV using proxy API
export const getLiveCategories = async (credentials: XtreamCredentials): Promise<LiveCategory[]> => {
  try {
    const response = await axios.post('/api/xtream', {
      server: credentials.server,
      username: credentials.username,
      password: credentials.password,
      action: 'get_live_categories'
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
    const params: Record<string, string> = {};
    
    if (categoryId) {
      params.category_id = categoryId;
    }
    
    const response = await axios.post('/api/xtream', {
      server: credentials.server,
      username: credentials.username,
      password: credentials.password,
      action: 'get_live_streams',
      params
    });
    
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
    const params: Record<string, string | number> = {
      stream_id: streamId
    };
    
    if (limit) {
      params.limit = limit;
    }
    
    const response = await axios.post('/api/xtream', {
      server: credentials.server,
      username: credentials.username,
      password: credentials.password,
      action: 'get_short_epg',
      params
    });
    
    return response.data.epg_listings;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch EPG: ${error.message}`);
    }
    throw error;
  }
};

// Movies (VOD) using proxy API
export const getMovieCategories = async (credentials: XtreamCredentials): Promise<MovieCategory[]> => {
  try {
    const response = await axios.post('/api/xtream', {
      server: credentials.server,
      username: credentials.username,
      password: credentials.password,
      action: 'get_vod_categories'
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
    const params: Record<string, string> = {};
    
    if (categoryId) {
      params.category_id = categoryId;
    }
    
    const response = await axios.post('/api/xtream', {
      server: credentials.server,
      username: credentials.username,
      password: credentials.password,
      action: 'get_vod_streams',
      params
    });
    
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
    const params: Record<string, string | number> = {
      vod_id: movieId
    };
    
    const response = await axios.post('/api/xtream', {
      server: credentials.server,
      username: credentials.username,
      password: credentials.password,
      action: 'get_vod_info',
      params
    });
    
    return response.data.info as Movie;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch movie info: ${error.message}`);
    }
    throw error;
  }
};

// Series using proxy API
export const getSeriesCategories = async (credentials: XtreamCredentials): Promise<SeriesCategory[]> => {
  try {
    const response = await axios.post('/api/xtream', {
      server: credentials.server,
      username: credentials.username,
      password: credentials.password,
      action: 'get_series_categories'
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
    const params: Record<string, string> = {};
    
    if (categoryId) {
      params.category_id = categoryId;
    }
    
    const response = await axios.post('/api/xtream', {
      server: credentials.server,
      username: credentials.username,
      password: credentials.password,
      action: 'get_series',
      params
    });
    
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
    const params: Record<string, string | number> = {
      series_id: seriesId
    };
    
    const response = await axios.post('/api/xtream', {
      server: credentials.server,
      username: credentials.username,
      password: credentials.password,
      action: 'get_series_info',
      params
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