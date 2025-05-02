'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Series } from '@/types';
import { useUserPreferencesStore } from '@/lib/store/user-preferences-store';
import { Star, Play, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProxiedImageUrl, getFallbackImageUrl } from '@/lib/utils/image-utils';

interface SeriesCardProps {
  series: Series;
  tmdbPoster?: string | null;
}

export function SeriesCard({ series, tmdbPoster }: SeriesCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const { 
    favorites, 
    addFavoriteSeries, 
    removeFavoriteSeries,
    watchHistory
  } = useUserPreferencesStore();
  
  const isFavorite = favorites.series.includes(series.series_id);
  
  // Check if series is in watch history
  const watchProgress = watchHistory.series.find(s => s.id === series.series_id);
  const inProgress = !!watchProgress;
  
  const handleClick = () => {
    router.push(`/series/${series.series_id}`);
  };
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isFavorite) {
      removeFavoriteSeries(series.series_id);
    } else {
      addFavoriteSeries(series.series_id);
    }
  };
  
  // Get the best available poster image
  const posterImage = tmdbPoster || series.cover;
  
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
                src={getProxiedImageUrl(posterImage)}
                alt={series.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-lg font-medium text-muted-foreground">
                  {series.name.substring(0, 2).toUpperCase()}
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
            
            {/* Continue watching badge */}
            {inProgress && (
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">
                Continue
              </div>
            )}
          </div>
          
          <div className="p-3">
            <h3 className="font-medium truncate">{series.name}</h3>
            
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Layers className="h-3 w-3 mr-1" />
                <span>{series.episode_run_time || 'Unknown seasons'}</span>
              </div>
              
              {series.rating && (
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400 mr-1" />
                  <span className="text-xs">{series.rating}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}