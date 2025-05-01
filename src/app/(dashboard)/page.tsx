'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useContentStore } from '@/lib/store/content-store';
import { useUserPreferencesStore } from '@/lib/store/user-preferences-store';
import { Button } from '@/components/ui/button';
import { Tv, Film, Layers, History } from 'lucide-react';
import { MovieCard } from '@/components/ui/movie-card';
import { SeriesCard } from '@/components/ui/series-card';
import { ChannelCard } from '@/components/ui/channel-card';

export default function DashboardPage() {
  const router = useRouter();
  const { credentials } = useAuthStore();
  const { 
    liveStreams, 
    movies, 
    series,
    fetchLiveStreams,
    fetchMovies,
    fetchSeries
  } = useContentStore();
  const { 
    favorites, 
    watchHistory 
  } = useUserPreferencesStore();
  
  // Fetch initial content if needed
  useEffect(() => {
    if (!credentials) return;
    
    // Fetch content if not already loaded
    if (!liveStreams.all) {
      fetchLiveStreams(credentials).catch(console.error);
    }
    
    if (!movies.all) {
      fetchMovies(credentials).catch(console.error);
    }
    
    if (!series.all) {
      fetchSeries(credentials).catch(console.error);
    }
  }, [credentials, liveStreams, movies, series, fetchLiveStreams, fetchMovies, fetchSeries]);
  
  // Get favorite channels
  const getFavoriteChannels = () => {
    if (!liveStreams.all) return [];
    
    return liveStreams.all.filter(channel => 
      favorites.channels.includes(channel.stream_id)
    ).slice(0, 6);
  };
  
  // Get favorite movies
  const getFavoriteMovies = () => {
    const allMovies = Object.values(movies).flat();
    
    return allMovies.filter(movie => 
      favorites.movies.includes(movie.stream_id)
    ).slice(0, 6);
  };
  
  // Get favorite series
  const getFavoriteSeries = () => {
    const allSeries = Object.values(series).flat();
    
    return allSeries.filter(s => 
      favorites.series.includes(s.series_id)
    ).slice(0, 6);
  };
  
  // Get recently watched movies
  const getRecentMovies = () => {
    const allMovies = Object.values(movies).flat();
    const recentMovieIds = watchHistory.movies
      .sort((a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime())
      .map(item => item.id)
      .slice(0, 6);
    
    return allMovies.filter(movie => 
      recentMovieIds.includes(movie.stream_id)
    );
  };
  
  // Get continue watching series
  const getContinueWatchingSeries = () => {
    const allSeries = Object.values(series).flat();
    const inProgressSeriesIds = watchHistory.series
      .sort((a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime())
      .map(item => item.id)
      .slice(0, 6);
    
    return allSeries.filter(s => 
      inProgressSeriesIds.includes(s.series_id)
    );
  };
  
  const favoriteChannels = getFavoriteChannels();
  const favoriteMovies = getFavoriteMovies();
  const favoriteSeries = getFavoriteSeries();
  const recentMovies = getRecentMovies();
  const continueWatchingSeries = getContinueWatchingSeries();
  
  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Welcome to IPTV Platform</h1>
      
      {/* Quick access buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button 
          size="lg" 
          className="h-24"
          onClick={() => router.push('/live')}
        >
          <Tv className="mr-2 h-6 w-6" />
          <span className="text-lg">Live TV</span>
        </Button>
        
        <Button 
          size="lg" 
          className="h-24"
          onClick={() => router.push('/movies')}
        >
          <Film className="mr-2 h-6 w-6" />
          <span className="text-lg">Movies</span>
        </Button>
        
        <Button 
          size="lg" 
          className="h-24"
          onClick={() => router.push('/series')}
        >
          <Layers className="mr-2 h-6 w-6" />
          <span className="text-lg">Series</span>
        </Button>
      </div>
      
      {/* Continue watching */}
      {(recentMovies.length > 0 || continueWatchingSeries.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center">
            <History className="mr-2 h-5 w-5" />
            <h2 className="text-2xl font-bold">Continue Watching</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentMovies.map(movie => (
              <MovieCard key={`movie-${movie.stream_id}`} movie={movie} />
            ))}
            
            {continueWatchingSeries.map(s => (
              <SeriesCard key={`series-${s.series_id}`} series={s} />
            ))}
            
            {recentMovies.length === 0 && continueWatchingSeries.length === 0 && (
              <div className="col-span-full py-8 text-center">
                <p className="text-muted-foreground">
                  No recently watched content. Start watching to see your history here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Favorite channels */}
      {favoriteChannels.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Favorite Channels</h2>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/live?tab=favorites')}
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {favoriteChannels.map(channel => (
              <ChannelCard key={channel.stream_id} channel={channel} />
            ))}
          </div>
        </div>
      )}
      
      {/* Favorite movies */}
      {favoriteMovies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Favorite Movies</h2>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/movies?tab=favorites')}
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favoriteMovies.map(movie => (
              <MovieCard key={movie.stream_id} movie={movie} />
            ))}
          </div>
        </div>
      )}
      
      {/* Favorite series */}
      {favoriteSeries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Favorite Series</h2>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/series?tab=favorites')}
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favoriteSeries.map(s => (
              <SeriesCard key={s.series_id} series={s} />
            ))}
          </div>
        </div>
      )}
      
      {/* No favorites message */}
      {favoriteChannels.length === 0 && favoriteMovies.length === 0 && favoriteSeries.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            You don't have any favorites yet. Add some by clicking the star icon on content.
          </p>
        </div>
      )}
    </div>
  );
}