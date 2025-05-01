'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePlayerStore } from '@/lib/store/player-store';
import { useUserPreferencesStore } from '@/lib/store/user-preferences-store';
import { VideoPlayer } from '@/components/player/video-player';
import { Button } from '@/components/ui/button';
import { getMovieInfo, getMovieUrl } from '@/lib/api/xtream';
import { getMovieDetails, searchMovie, getSimilarMovies, getTMDBImageUrl } from '@/lib/api/tmdb';
import { Movie, TMDBMovie } from '@/types';
import { Star, Clock, Calendar, Film, Play, ArrowLeft, Heart } from 'lucide-react';
import { MovieCard } from '@/components/ui/movie-card';
import { motion } from 'framer-motion';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { credentials } = useAuthStore();
  const { source, setSource } = usePlayerStore();
  const { 
    favorites, 
    addFavoriteMovie, 
    removeFavoriteMovie,
    updateMovieHistory
  } = useUserPreferencesStore();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [tmdbMovie, setTmdbMovie] = useState<TMDBMovie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const movieId = Number(params.movieId);
  const isFavorite = favorites.movies.includes(movieId);
  
  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!credentials || !movieId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch movie info from Xtream API
        const movieInfo = await getMovieInfo(credentials, movieId);
        setMovie(movieInfo);
        
        // Try to find movie on TMDB for additional details
        if (movieInfo.name) {
          try {
            // Search for movie on TMDB
            const searchResults = await searchMovie(
              movieInfo.name,
              movieInfo.year
            );
            
            if (searchResults && searchResults.length > 0) {
              // Get detailed info for the first result
              const tmdbDetails = await getMovieDetails(searchResults[0].id);
              setTmdbMovie(tmdbDetails);
              
              // Get similar movies
              const similar = await getSimilarMovies(searchResults[0].id);
              setSimilarMovies(similar);
            }
          } catch (tmdbError) {
            console.error('Failed to fetch TMDB data:', tmdbError);
            // Continue without TMDB data
          }
        }
      } catch (error) {
        console.error('Failed to fetch movie details:', error);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovieDetails();
  }, [credentials, movieId]);
  
  // Play movie
  const playMovie = () => {
    if (!credentials || !movie) return;
    
    // Get movie stream URL
    const streamUrl = getMovieUrl(
      credentials, 
      movieId, 
      movie.container_extension || 'mp4'
    );
    
    // Set player source
    setSource(streamUrl, movie.name, 'movie');
    
    // Update watch history
    updateMovieHistory(movieId, 0);
    
    // Set playing state
    setIsPlaying(true);
  };
  
  // Toggle favorite
  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteMovie(movieId);
    } else {
      addFavoriteMovie(movieId);
    }
  };
  
  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    if (!minutes) return 'Unknown';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };
  
  // Get backdrop image
  const backdropUrl = tmdbMovie?.backdrop_path 
    ? getTMDBImageUrl(tmdbMovie.backdrop_path, 'original')
    : null;
  
  // Get poster image
  const posterUrl = tmdbMovie?.poster_path 
    ? getTMDBImageUrl(tmdbMovie.poster_path, 'w500')
    : movie?.stream_icon || null;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  
  if (error || !movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-lg text-muted-foreground">{error || 'Movie not found'}</p>
        <Button onClick={() => router.push('/movies')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Movies
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={() => router.push('/movies')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Movies
      </Button>
      
      {isPlaying ? (
        // Video player
        <div className="w-full">
          <VideoPlayer />
        </div>
      ) : (
        // Movie header with backdrop
        <div className="relative w-full rounded-lg overflow-hidden">
          {backdropUrl ? (
            <div className="relative aspect-video w-full">
              <Image
                src={backdropUrl}
                alt={movie.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>
          ) : (
            <div className="aspect-video w-full bg-muted" />
          )}
          
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={playMovie}
              className="rounded-full bg-primary p-6 text-primary-foreground shadow-lg"
            >
              <Play className="h-12 w-12" />
            </motion.button>
          </div>
        </div>
      )}
      
      {/* Movie details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Poster and basic info */}
        <div className="md:col-span-1">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={movie.name}
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
              className="w-full"
              onClick={playMovie}
            >
              <Play className="mr-2 h-4 w-4" />
              Play Movie
            </Button>
            
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
                <span>Released: {movie.year || tmdbMovie?.release_date?.split('-')[0] || 'Unknown'}</span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>Duration: {formatDuration(tmdbMovie?.runtime || parseInt(movie.duration || '0'))}</span>
              </div>
              
              {(movie.rating || tmdbMovie?.vote_average) && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="mr-2 h-4 w-4 text-yellow-400" />
                  <span>Rating: {movie.rating || (tmdbMovie?.vote_average ? (tmdbMovie.vote_average / 2).toFixed(1) : 'Unknown')}/5</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Description and details */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{movie.name}</h1>
            {tmdbMovie?.title !== movie.name && tmdbMovie?.title && (
              <p className="text-lg text-muted-foreground">{tmdbMovie.title}</p>
            )}
          </div>
          
          {/* Genre tags */}
          {tmdbMovie?.genres && tmdbMovie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tmdbMovie.genres.map(genre => (
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
              {tmdbMovie?.overview || movie.plot || 'No description available.'}
            </p>
          </div>
          
          {/* Cast and crew */}
          {tmdbMovie?.credits && (
            <div className="space-y-4">
              {/* Director */}
              {tmdbMovie.credits.crew.some(person => person.job === 'Director') && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Director</h2>
                  <div className="flex flex-wrap gap-2">
                    {tmdbMovie.credits.crew
                      .filter(person => person.job === 'Director')
                      .map(director => (
                        <span key={director.id} className="text-muted-foreground">
                          {director.name}
                        </span>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Cast */}
              {tmdbMovie.credits.cast.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Cast</h2>
                  <div className="flex flex-wrap gap-2">
                    {tmdbMovie.credits.cast.slice(0, 10).map(actor => (
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
          )}
        </div>
      </div>
      
      {/* Similar movies */}
      {similarMovies.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Similar Movies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {similarMovies.slice(0, 12).map(similar => (
              <MovieCard
                key={similar.id}
                movie={{
                  stream_id: 0, // Placeholder
                  name: similar.title,
                  stream_icon: '',
                  added: '',
                  category_id: '',
                  container_extension: '',
                  custom_sid: '',
                  direct_source: '',
                  plot: similar.overview || '',
                  rating: similar.vote_average ? (similar.vote_average / 2).toString() : '',
                  year: similar.release_date?.split('-')[0] || '',
                  genre: '',
                  director: '',
                  cast: '',
                  duration: similar.runtime?.toString() || '',
                  stream_type: '',
                  num: 0
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