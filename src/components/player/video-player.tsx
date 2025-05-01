'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { usePlayerStore } from '@/lib/store/player-store';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Subtitles,
  X
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

export function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  
  const {
    source,
    title,
    type,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    playbackRate,
    quality,
    subtitles,
    selectedSubtitle,
    audioTracks,
    selectedAudioTrack,
    setPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setMuted,
    setFullscreen,
    setPlaybackRate,
    setQuality,
    setSelectedSubtitle,
    setSelectedAudioTrack
  } = usePlayerStore();
  
  // Format time (seconds) to MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Initialize HLS player when source changes
  useEffect(() => {
    if (!source || !videoRef.current) return;
    
    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    // Check if the source is an HLS stream
    if (source.includes('.m3u8')) {
      // Check if HLS is supported natively
      if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = source;
      } else if (Hls.isSupported()) {
        // Use HLS.js if available
        const hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 60
        });
        
        hls.loadSource(source);
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // Get available quality levels
          const levels = hls.levels.map((level) => ({
            height: level.height,
            bitrate: level.bitrate
          }));
          
          console.log('Available quality levels:', levels);
          
          // Auto-play when ready
          if (isPlaying) {
            videoRef.current?.play().catch(console.error);
          }
        });
        
        // Handle errors
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal error, cannot recover');
                hls.destroy();
                break;
            }
          }
        });
        
        hlsRef.current = hls;
      }
    } else {
      // Regular video source
      videoRef.current.src = source;
      
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      }
    }
    
    // Set initial volume and mute state
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
      videoRef.current.playbackRate = playbackRate;
    }
    
    // Reset controls timeout
    resetControlsTimeout();
    
    // Clean up on unmount
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [source, isPlaying, volume, isMuted, playbackRate]);
  
  // Handle play/pause
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.play().catch(console.error);
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);
  
  // Handle volume changes
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume;
  }, [volume]);
  
  // Handle mute changes
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = isMuted;
  }, [isMuted]);
  
  // Handle playback rate changes
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);
  
  // Handle fullscreen changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    if (isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(console.error);
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
    }
  }, [isFullscreen]);
  
  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [setFullscreen]);
  
  // Auto-hide controls
  const resetControlsTimeout = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    setShowControls(true);
    
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    
    setControlsTimeout(timeout);
  };
  
  // Handle mouse movement to show controls
  const handleMouseMove = () => {
    resetControlsTimeout();
  };
  
  // Handle video events
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  const handleEnded = () => {
    setPlaying(false);
  };
  
  const handlePlay = () => {
    setPlaying(true);
  };
  
  const handlePause = () => {
    setPlaying(false);
  };
  
  const handleVolumeChange = () => {
    if (videoRef.current) {
      setVolume(videoRef.current.volume);
      setMuted(videoRef.current.muted);
    }
  };
  
  const handleWaiting = () => {
    setIsBuffering(true);
  };
  
  const handlePlaying = () => {
    setIsBuffering(false);
  };
  
  // Handle seek
  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };
  
  // Handle volume change
  const handleVolumeSliderChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      
      if (newVolume === 0) {
        videoRef.current.muted = true;
        setMuted(true);
      } else if (isMuted) {
        videoRef.current.muted = false;
        setMuted(false);
      }
    }
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    setPlaying(!isPlaying);
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setMuted(newMutedState);
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    setFullscreen(!isFullscreen);
  };
  
  // Seek forward/backward
  const seekForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(videoRef.current.currentTime + 10, duration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const seekBackward = () => {
    if (videoRef.current) {
      const newTime = Math.max(videoRef.current.currentTime - 10, 0);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  // Change playback rate
  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
    setShowSettings(false);
  };
  
  // Change subtitle
  const changeSubtitle = (id: string | null) => {
    setSelectedSubtitle(id);
    setShowSettings(false);
  };
  
  // Change audio track
  const changeAudioTrack = (id: string | null) => {
    setSelectedAudioTrack(id);
    setShowSettings(false);
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onClick={() => type !== 'live' && togglePlay()}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onEnded={handleEnded}
        onPlay={handlePlay}
        onPause={handlePause}
        onVolumeChange={handleVolumeChange}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
      />
      
      {/* Title overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent"
          >
            <h2 className="text-white font-medium truncate">{title}</h2>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Buffering indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      )}
      
      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
          >
            {/* Progress bar (not for live TV) */}
            {type !== 'live' && (
              <div className="mb-4">
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}
            
            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {type !== 'live' && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        seekBackward();
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        seekForward();
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </>
                )}
                
                {type === 'live' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                )}
                
                <div className="flex items-center space-x-2 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                  
                  <div className="w-24 hidden sm:block">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        e.stopPropagation();
                        handleVolumeSliderChange(e);
                      }}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {(subtitles.length > 0 || audioTracks.length > 0) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSettings(true);
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Settings dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Player Settings</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="playback">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="playback">Playback</TabsTrigger>
              <TabsTrigger value="subtitles">Subtitles</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
            </TabsList>
            
            <TabsContent value="playback" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Playback Speed</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                    <Button
                      key={rate}
                      variant={playbackRate === rate ? "default" : "outline"}
                      size="sm"
                      onClick={() => changePlaybackRate(rate)}
                    >
                      {rate === 1 ? 'Normal' : `${rate}x`}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="subtitles" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Subtitle Options</h3>
                <div className="space-y-2">
                  <Button
                    variant={selectedSubtitle === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => changeSubtitle(null)}
                    className="w-full justify-start"
                  >
                    Off
                  </Button>
                  
                  {subtitles.map((subtitle) => (
                    <Button
                      key={subtitle.id}
                      variant={selectedSubtitle === subtitle.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => changeSubtitle(subtitle.id)}
                      className="w-full justify-start"
                    >
                      {subtitle.language}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="audio" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Audio Tracks</h3>
                <div className="space-y-2">
                  {audioTracks.map((track) => (
                    <Button
                      key={track.id}
                      variant={selectedAudioTrack === track.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => changeAudioTrack(track.id)}
                      className="w-full justify-start"
                    >
                      {track.language}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}