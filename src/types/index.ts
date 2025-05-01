// Authentication types
export interface XtreamCredentials {
  server: string;
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  credentials: XtreamCredentials | null;
  user: UserInfo | null;
  error: string | null;
}

export interface UserInfo {
  username: string;
  password: string;
  message: string;
  auth: number;
  status: string;
  exp_date: string;
  is_trial: string;
  active_cons: string;
  created_at: string;
  max_connections: string;
  allowed_output_formats: string[];
}

// Content types
export interface Category {
  category_id: string;
  category_name: string;
  parent_id?: number;
}

// Live TV types
export interface LiveCategory extends Category {}

export interface LiveStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

export interface EPGInfo {
  id: string;
  start: string; // ISO date string
  end: string; // ISO date string
  title: string;
  description: string;
  channel: string;
}

// Movie types
export interface MovieCategory extends Category {}

export interface Movie {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
  rating: string;
  year: string;
  genre: string;
  plot: string;
  cast: string;
  director: string;
  duration: string;
}

// Series types
export interface SeriesCategory extends Category {}

export interface Series {
  num: number;
  name: string;
  series_id: number;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  release_date: string;
  last_modified: string;
  rating: string;
  rating_5based: number;
  backdrop_path: string[];
  youtube_trailer: string;
  episode_run_time: string;
  category_id: string;
}

export interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  season_number: number;
  cover: string;
}

export interface Episode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    movie_image: string;
    plot: string;
    duration_secs: number;
    duration: string;
    releasedate: string;
    rating: string;
  };
  added: string;
  season: number;
  direct_source: string;
}

// TMDB types for enriched content
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  runtime: number;
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      department: string;
    }[];
  };
}

export interface TMDBSeries {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      department: string;
    }[];
  };
}

// Player types
export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  quality: string;
  source: string;
  title: string;
  type: 'live' | 'movie' | 'series';
  subtitles: Subtitle[];
  selectedSubtitle: string | null;
  audioTracks: AudioTrack[];
  selectedAudioTrack: string | null;
}

export interface Subtitle {
  id: string;
  language: string;
  url: string;
}

export interface AudioTrack {
  id: string;
  language: string;
  url: string;
}

// Settings types
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  parentalControl: {
    enabled: boolean;
    pin: string;
  };
  player: {
    autoPlay: boolean;
    autoNext: boolean;
    defaultSubtitleLanguage: string | null;
    defaultAudioLanguage: string | null;
    bufferSize: number;
  };
}

// User preferences
export interface UserPreferences {
  favorites: {
    channels: number[];
    movies: number[];
    series: number[];
  };
  watchHistory: {
    channels: {
      id: number;
      lastWatched: string; // ISO date string
    }[];
    movies: {
      id: number;
      progress: number; // 0-1 percentage
      lastWatched: string; // ISO date string
    }[];
    series: {
      id: number;
      season: number;
      episode: number;
      progress: number; // 0-1 percentage
      lastWatched: string; // ISO date string
    }[];
  };
}