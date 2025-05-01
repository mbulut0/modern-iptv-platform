'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePlayerStore } from '@/lib/store/player-store';
import { useUserPreferencesStore } from '@/lib/store/user-preferences-store';
import { VideoPlayer } from '@/components/player/video-player';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSeriesInfo, getSeriesSeasons, getEpisodeUrl } from '@/lib/api/xtream';
import { searchTVShow, getTVShowDetails, getSimilarTVShows, getTMDBImageUrl } from '@/lib/api/tmdb';
import { Series, SeriesSeason, SeriesEpisode, TMDBTVShow } from '@/types';
import { Star, Calendar, Film, Play, ArrowLeft, Heart, ChevronDown, Check } from 'lucide-react';
import { SeriesCard } from '@/components/ui/series-card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { credentials } = useAuthStore();
  const { source, setSource } = usePlayerStore();
  const { 
    favorites, 
    addFavoriteSeries, 
    removeFavoriteSeries,
    watchHistory,
    updateSeriesHistory
  } = useUserPreferencesStore();
  
  const [series, setSeries] = useState<Series | null>(null);
  const [seasons, setSeasons] = useState<SeriesSeason[]>([]);
  const [episodes, setEpisodes] = useState<Record<string, SeriesEpisode[]>>({});
  const [tmdbShow, setTmdbShow] = useState<TMDBTVShow | null>(null);
  const [similarShows, setSimilarShows] = useState<TMDBTVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [expandedSeasons, setExpandedSeasons] = useState<Record<string, boolean>>({});
  const [currentEpisode, setCurrentEpisode] = useState<SeriesEpisode | null>(null);
  
  const seriesId = Number(params.seriesId);
  const isFavorite = favorites.series.includes(seriesId);
  
  // Get watch history for this series
  const seriesHistory = watchHistory.series.find(s => s.id === seriesId);
  
  // Fetch series details
  useEffect(() => {
    const fetchSeriesDetails = async () => {
      if (!credentials || !seriesId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch series info from Xtream API
        const seriesInfo = await getSeriesInfo(credentials, seriesId);
        setSeries(seriesInfo);
        
        // Fetch seasons
        const seriesSeasons = await getSeriesSeasons(credentials, seriesId);
        setSeasons(seriesSeasons);
        
        // Set first season as selected by default
        if (seriesSeasons.length > 0) {
          setSelectedSeason(seriesSeasons[0].season_number);
          
          // If there's watch history, try to find the last watched season
          if (seriesHistory && seriesHistory.lastEpisode) {
            const lastWatchedSeason = seriesHistory.lastEpisode.season;
            const matchingSeason = seriesSeasons.find(
              s => s.season_number === lastWatchedSeason
            );
            
            if (matchingSeason) {
              setSelectedSeason(matchingSeason.season_number);
              setExpandedSeasons(prev => ({
                ...prev,
                [matchingSeason.season_number]: true
              }));
            }
          }
        }
        
        // Try to find series on TMDB for additional details
        if (seriesInfo.name) {
          try {
            // Search for TV show on TMDB
            const searchResults = await searchTVShow(seriesInfo.name);
            
            if (searchResults && searchResults.length > 0) {
              // Get detailed info for the first result
              const tmdbDetails = await getTVShowDetails(searchResults[0].id);
              setTmdbShow(tmdbDetails);
              
              // Get similar shows
              const similar = await getSimilarTVShows(searchResults[0].id);
              setSimilarShows(similar);
            }
          } catch (tmdbError) {
            console.error('Failed to fetch TMDB data:', tmdbError);
            // Continue without TMDB data
          }
        }
      } catch (error) {
        console.error('Failed to fetch series details:', error);
        setError('Failed to load series details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSeriesDetails();
  }, [credentials, seriesId, seriesHistory]);
  
  // Fetch episodes for selected season
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!credentials || !seriesId || !selectedSeason) return;
      
      // Check if episodes for this season are already loaded
      if (episodes[selectedSeason]) return;
      
      try {
        // Fetch episodes from Xtream API
        const seasonEpisodes = await getSeriesSeasons(
          credentials, 
          seriesId, 
          selectedSeason
        );
        
        setEpisodes(prev => ({
          ...prev,
          [selectedSeason]: seasonEpisodes
        }));
        
        // If there's watch history, find the last watched episode
        if (seriesHistory && 
            seriesHistory.lastEpisode && 
            seriesHistory.lastEpisode.season === selectedSeason) {
          
          const lastEpisodeId = seriesHistory.lastEpisode.episode;
          const matchingEpisode = seasonEpisodes.find(
            e => e.episode_num === lastEpisodeId
          );
          
          if (matchingEpisode) {
            setCurrentEpisode(matchingEpisode);
          }
        }
      } catch (error) {
        console.error(`Failed to fetch episodes for season ${selectedSeason}:`, error);
      }
    };
    
    fetchEpisodes();
  }, [credentials, seriesId, selectedSeason, episodes, seriesHistory]);
  
  // Play episode
  const playEpisode = (episode: SeriesEpisode) => {
    if (!credentials || !episode) return;
    
    // Get episode stream URL
    const streamUrl = getEpisodeUrl(
      credentials, 
      episode.id, 
      episode.container_extension || 'mp4'
    );
    
    // Set player source
    setSource(
      streamUrl, 
      `${series?.name} - S${episode.season}E${episode.episode_num} - ${episode.title}`, 
      'episode'
    );
    
    // Update watch history
    updateSeriesHistory(
      seriesId, 
      episode.season, 
      episode.episode_num
    );
    
    // Set current episode and playing state
    setCurrentEpisode(episode);
    setIsPlaying(true);
  };
  
  // Toggle favorite
  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteSeries(seriesId);
    } else {
      addFavoriteSeries(seriesId);
    }
  };
  
  // Toggle season expansion
  const toggleSeasonExpansion = (seasonNumber: string) => {
    setExpandedSeasons(prev => ({
      ...prev,
      [seasonNumber]: !prev[seasonNumber]
    }));
    
    // If expanding, make sure episodes are loaded
    if (!expandedSeasons[seasonNumber]) {
      setSelectedSeason(seasonNumber);
    }
  };
  
  // Check if episode is watched
  const isEpisodeWatched = (season: string, episode: string) => {
    if (!seriesHistory) return false;
    
    return seriesHistory.watchedEpisodes.some(
      e => e.season === season && e.episode === episode
    );
  };
  
  // Get backdrop image
  const backdropUrl = tmdbShow?.backdrop_path 
    ? getTMDBImageUrl(tmdbShow.backdrop_path, 'original')
    : null;
  
  // Get poster image
  const posterUrl = tmdbShow?.poster_path 
    ? getTMDBImageUrl(tmdbShow.poster_path, 'w500')
    : series?.cover || null;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  
  if (error || !series) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-lg text-muted-foreground">{error || 'Series not found'}</p>
        <Button onClick={() => router.push('/series')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Series
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={() => router.push('/series')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Series
      </Button>
      
      {isPlaying ? (
        // Video player
        <div className="w-full">
          <VideoPlayer />
        </div>
      ) : (
        // Series header with backdrop
        <div className="relative w-full rounded-lg overflow-hidden">
          {backdropUrl ? (
            <div className="relative aspect-video w-full">
              <Image
                src={backdropUrl}
                alt={series.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>
          ) : (
            <div className="aspect-video w-full bg-muted" />
          )}
          
          {seriesHistory && seriesHistory.lastEpisode && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <p className="text-white text-lg font-medium">
                  Continue watching Season {seriesHistory.lastEpisode.season}, Episode {seriesHistory.lastEpisode.episode}
                </p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    // Find the episode to continue
                    const season = seriesHistory.lastEpisode.season;
                    const episodeNum = seriesHistory.lastEpisode.episode;
                    
                    if (episodes[season]) {
                      const episode = episodes[season].find(
                        e => e.episode_num === episodeNum
                      );
                      
                      if (episode) {
                        playEpisode(episode);
                      }
                    }
                  }}
                  className="rounded-full bg-primary p-6 text-primary-foreground shadow-lg"
                >
                  <Play className="h-12 w-12" />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Series details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Poster and basic info */}
        <div className="md:col-span-1">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={series.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Film className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="mt-4 space-y-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={toggleFavorite}
            >
              <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </Button>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                <span>First aired: {series.year || tmdbShow?.first_air_date?.split('-')[0] || 'Unknown'}</span>
              </div>
              
              {(series.rating || tmdbShow?.vote_average) && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="mr-2 h-4 w-4 text-yellow-400" />
                  <span>Rating: {series.rating || (tmdbShow?.vote_average ? (tmdbShow.vote_average / 2).toFixed(1) : 'Unknown')}/5</span>
                </div>
              )}
              
              <div className="flex items-center text-sm text-muted-foreground">
                <span>Seasons: {seasons.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Description and details */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{series.name}</h1>
            {tmdbShow?.name !== series.name && tmdbShow?.name && (
              <p className="text-lg text-muted-foreground">{tmdbShow.name}</p>
            )}
          </div>
          
          {/* Genre tags */}
          {tmdbShow?.genres && tmdbShow.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tmdbShow.genres.map(genre => (
                <span 
                  key={genre.id}
                  className="px-3 py-1 bg-muted rounded-full text-xs"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}
          
          {/* Plot */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p className="text-muted-foreground">
              {tmdbShow?.overview || series.plot || 'No description available.'}
            </p>
          </div>
          
          {/* Cast and crew */}
          {tmdbShow?.credits && tmdbShow.credits.cast.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Cast</h2>
              <div className="flex flex-wrap gap-2">
                {tmdbShow.credits.cast.slice(0, 10).map(actor => (
                  <span 
                    key={actor.id}
                    className="px-3 py-1 bg-muted rounded-full text-xs"
                  >
                    {actor.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Seasons and Episodes */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Seasons & Episodes</h2>
        
        <div className="space-y-4">
          {seasons.map((season) => (
            <div key={season.season_number} className="border rounded-lg overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => toggleSeasonExpansion(season.season_number)}
              >
                <div>
                  <h3 className="text-lg font-medium">
                    Season {season.season_number}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {season.episode_count} episodes
                  </p>
                </div>
                <ChevronDown 
                  className={cn(
                    "h-5 w-5 transition-transform",
                    expandedSeasons[season.season_number] ? "transform rotate-180" : ""
                  )} 
                />
              </div>
              
              <AnimatePresence>
                {expandedSeasons[season.season_number] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t">
                      {episodes[season.season_number] ? (
                        <div className="space-y-2">
                          {episodes[season.season_number].map((episode) => (
                            <div 
                              key={episode.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-md cursor-pointer",
                                isEpisodeWatched(season.season_number, episode.episode_num) 
                                  ? "bg-muted/30" 
                                  : "hover:bg-muted/50"
                              )}
                              onClick={() => playEpisode(episode)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                                  {isEpisodeWatched(season.season_number, episode.episode_num) ? (
                                    <Check className="h-5 w-5 text-primary" />
                                  ) : (
                                    <Play className="h-5 w-5" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium">
                                    {episode.episode_num}. {episode.title || `Episode ${episode.episode_num}`}
                                  </h4>
                                  {episode.info && (
                                    <p className="text-sm text-muted-foreground truncate max-w-md">
                                      {episode.info}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {episode.duration ? `${episode.duration} min` : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
      
      {/* Similar series */}
      {similarShows.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Similar Series</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {similarShows.slice(0, 12).map(similar => (
              <SeriesCard
                key={similar.id}
                series={{
                  series_id: 0, // Placeholder
                  name: similar.name,
                  cover: '',
                  category_id: '',
                  cover_big: '',
                  episode_run_time: similar.number_of_seasons?.toString() || '',
                  genre: '',
                  last_modified: '',
                  plot: similar.overview || '',
                  rating: similar.vote_average ? (similar.vote_average / 2).toString() : '',
                  rating_5based: 0,
                  year: similar.first_air_date?.split('-')[0] || '',
                  cast: '',
                  director: '',
                  releaseDate: '',
                  status: '',
                  youtubeTrailer: ''
                }}
                tmdbPoster={getTMDBImageUrl(similar.poster_path)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}