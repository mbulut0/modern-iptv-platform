'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Movie } from '@/types';
import { useUserPreferencesStore } from '@/lib/store/user-preferences-store';
import { Star, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTMDBImageUrl } from '@/lib/api/tmdb';

interface MovieCardProps {
  movie: Movie;
  tmdbPoster?: string | null;
}

export function MovieCard({ movie, tmdbPoster }: MovieCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const { 
    favorites, 
    addFavoriteMovie, 
    removeFavoriteMovie,
    watchHistory
  } = useUserPreferencesStore();
  
  const isFavorite = favorites.movies.includes(movie.stream_id);
  
  // Check if movie is in watch history
  const watchProgress = watchHistory.movies.find(m => m.id === movie.stream_id);
  const hasProgress = watchProgress && watchProgress.progress > 0 && watchProgress.progress < 0.95;
  
  const handleClick = () => {
    router.push(`/movies/${movie.stream_id}`);
  };
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isFavorite) {
      removeFavoriteMovie(movie.stream_id);
    } else {
      addFavoriteMovie(movie.stream_id);
    }
  };
  
  // Get the best available poster image
  const posterImage = tmdbPoster || movie.stream_icon;
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
        onClick={handleClick}
      >
        <CardContent className="p-0">
          <div className="relative aspect-[2/3] bg-muted">
            {!imageError && posterImage ? (
              <Image
                src={posterImage}
                alt={movie.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-lg font-medium text-muted-foreground">
                  {movie.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            
            <button
              className={cn(
                "absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background transition-colors",
                isFavorite ? "text-yellow-400" : "text-muted-foreground"
              )}
              onClick={toggleFavorite}
            >
              <Star className="h-4 w-4" />
            </button>
            
            {/* Play button overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
              <div className="rounded-full bg-primary p-3">
                <Play className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            
            {/* Progress bar for watched movies */}
            {hasProgress && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${watchProgress.progress * 100}%` }}
                />
              </div>
            )}
          </div>
          
          <div className="p-3">
            <h3 className="font-medium truncate">{movie.name}</h3>
            
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-muted-foreground">
                {movie.year || 'Unknown year'}
              </span>
              
              {movie.rating && (
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400 mr-1" />
                  <span className="text-xs">{movie.rating}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}