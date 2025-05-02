'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LiveStream } from '@/types';
import { usePlayerStore } from '@/lib/store/player-store';
import { useUserPreferencesStore } from '@/lib/store/user-preferences-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { getLiveStreamUrl } from '@/lib/api/xtream';
import { Star, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProxiedImageUrl, getFallbackImageUrl } from '@/lib/utils/image-utils';

interface ChannelCardProps {
  channel: LiveStream;
  currentProgram?: {
    title: string;
    startTime: string;
    endTime: string;
  };
  nextProgram?: {
    title: string;
    startTime: string;
  };
  onClick?: () => void;
}

export function ChannelCard({ 
  channel, 
  currentProgram, 
  nextProgram,
  onClick 
}: ChannelCardProps) {
  const [imageError, setImageError] = useState(false);
  const { setSource } = usePlayerStore();
  const { credentials } = useAuthStore();
  const { 
    favorites, 
    addFavoriteChannel, 
    removeFavoriteChannel,
    updateChannelHistory
  } = useUserPreferencesStore();
  
  const isFavorite = favorites.channels.includes(channel.stream_id);
  
  const handlePlay = () => {
    if (!credentials) return;
    
    // Get stream URL
    const streamUrl = getLiveStreamUrl(credentials, channel.stream_id);
    
    // Set player source
    setSource(streamUrl, channel.name, 'live');
    
    // Update watch history
    updateChannelHistory(channel.stream_id);
    
    // Call onClick if provided
    if (onClick) {
      onClick();
    }
  };
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isFavorite) {
      removeFavoriteChannel(channel.stream_id);
    } else {
      addFavoriteChannel(channel.stream_id);
    }
  };
  
  // Format time from "HH:MM" to "HH:MM AM/PM"
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return timeString;
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
        onClick={handlePlay}
      >
        <CardContent className="p-0">
          <div className="relative aspect-video bg-muted">
            {!imageError && channel.stream_icon ? (
              <Image
                src={getProxiedImageUrl(channel.stream_icon)}
                alt={channel.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain"
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-lg font-medium text-muted-foreground">
                  {channel.name.substring(0, 2).toUpperCase()}
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
          </div>
          
          <div className="p-3">
            <h3 className="font-medium truncate">{channel.name}</h3>
            
            {currentProgram && (
              <div className="mt-1 space-y-1">
                <div className="flex items-start text-sm">
                  <div className="flex-shrink-0 mr-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-muted-foreground">
                      {currentProgram.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(currentProgram.startTime)} - {formatTime(currentProgram.endTime)}
                    </p>
                  </div>
                </div>
                
                {nextProgram && (
                  <div className="flex items-start text-sm">
                    <div className="flex-shrink-0 mr-1 mt-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-muted-foreground">
                        Next: {nextProgram.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(nextProgram.startTime)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!currentProgram && (
              <p className="mt-1 text-sm text-muted-foreground">
                No program information available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}