'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useContentStore } from '@/lib/store/content-store';
import { usePlayerStore } from '@/lib/store/player-store';
import { CategorySelector } from '@/components/ui/category-selector';
import { ChannelCard } from '@/components/ui/channel-card';
import { VideoPlayer } from '@/components/player/video-player';
import { LiveStream } from '@/types';
import { getEPG, getLiveStreamUrl } from '@/lib/api/xtream';
import { useUserPreferencesStore } from '@/lib/store/user-preferences-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star } from 'lucide-react';

export default function LivePage() {
  const { credentials } = useAuthStore();
  const { 
    liveCategories, 
    liveStreams, 
    selectedLiveCategory,
    fetchLiveStreams,
    setSelectedLiveCategory
  } = useContentStore();
  const { source } = usePlayerStore();
  const { favorites } = useUserPreferencesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [epgData, setEpgData] = useState<Record<number, any>>({});
  const [isLoadingEpg, setIsLoadingEpg] = useState(false);
  
  // Get streams based on selected category or search
  const getFilteredStreams = (): LiveStream[] => {
    let streams: LiveStream[] = [];
    
    if (activeTab === 'favorites') {
      // Get favorite channels
      const allStreams = Object.values(liveStreams).flat();
      streams = allStreams.filter(stream => 
        favorites.channels.includes(stream.stream_id)
      );
    } else if (selectedLiveCategory && liveStreams[selectedLiveCategory]) {
      // Get streams for selected category
      streams = liveStreams[selectedLiveCategory];
    } else if (liveStreams.all) {
      // Get all streams
      streams = liveStreams.all;
    }
    
    // Apply search filter if needed
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      streams = streams.filter(stream => 
        stream.name.toLowerCase().includes(query)
      );
    }
    
    return streams;
  };
  
  // Fetch streams when category changes
  useEffect(() => {
    if (!credentials) return;
    
    // Fetch streams for selected category
    if (selectedLiveCategory) {
      if (!liveStreams[selectedLiveCategory]) {
        fetchLiveStreams(credentials, selectedLiveCategory).catch(console.error);
      }
    } else if (!liveStreams.all) {
      // Fetch all streams if not already loaded
      fetchLiveStreams(credentials).catch(console.error);
    }
  }, [credentials, selectedLiveCategory, liveStreams, fetchLiveStreams]);
  
  // Fetch EPG data for visible channels
  useEffect(() => {
    const fetchEpgForChannels = async () => {
      if (!credentials) return;
      
      const streams = getFilteredStreams();
      if (streams.length === 0) return;
      
      setIsLoadingEpg(true);
      
      try {
        // Fetch EPG for first 20 channels to avoid overloading
        const channelsToFetch = streams.slice(0, 20);
        
        const epgPromises = channelsToFetch.map(async (stream) => {
          if (!stream.epg_channel_id) return null;
          
          try {
            const epgData = await getEPG(credentials, stream.stream_id, 2);
            return { streamId: stream.stream_id, epg: epgData };
          } catch (error) {
            console.error(`Failed to fetch EPG for channel ${stream.stream_id}:`, error);
            return null;
          }
        });
        
        const results = await Promise.all(epgPromises);
        
        const newEpgData: Record<number, any> = {};
        results.forEach(result => {
          if (result) {
            newEpgData[result.streamId] = result.epg;
          }
        });
        
        setEpgData(prev => ({ ...prev, ...newEpgData }));
      } catch (error) {
        console.error('Failed to fetch EPG data:', error);
      } finally {
        setIsLoadingEpg(false);
      }
    };
    
    fetchEpgForChannels();
  }, [credentials, selectedLiveCategory, activeTab]);
  
  // Get current and next program for a channel
  const getChannelPrograms = (streamId: number) => {
    if (!epgData[streamId] || !Array.isArray(epgData[streamId])) {
      return { current: undefined, next: undefined };
    }
    
    const now = Math.floor(Date.now() / 1000);
    const programs = epgData[streamId];
    
    const current = programs.find(program => 
      program.start_timestamp <= now && program.stop_timestamp > now
    );
    
    const next = programs.find(program => 
      program.start_timestamp > now
    );
    
    return {
      current: current ? {
        title: current.title,
        startTime: new Date(current.start_timestamp * 1000).toTimeString().slice(0, 5),
        endTime: new Date(current.stop_timestamp * 1000).toTimeString().slice(0, 5)
      } : undefined,
      next: next ? {
        title: next.title,
        startTime: new Date(next.start_timestamp * 1000).toTimeString().slice(0, 5)
      } : undefined
    };
  };
  
  // Play first channel if no source is set
  useEffect(() => {
    if (!credentials || source || !liveStreams.all || liveStreams.all.length === 0) return;
    
    // Auto-play first channel
    const firstChannel = liveStreams.all[0];
    if (firstChannel) {
      const streamUrl = getLiveStreamUrl(credentials, firstChannel.stream_id);
      usePlayerStore.getState().setSource(streamUrl, firstChannel.name, 'live');
    }
  }, [credentials, source, liveStreams]);
  
  const filteredStreams = getFilteredStreams();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Live TV</h1>
      
      {/* Player */}
      <div className="w-full">
        <VideoPlayer />
      </div>
      
      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All Channels</TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>Favorites</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      {/* Categories */}
      {activeTab === 'all' && (
        <div className="py-2">
          <CategorySelector
            categories={liveCategories}
            selectedCategoryId={selectedLiveCategory}
            onSelectCategory={setSelectedLiveCategory}
          />
        </div>
      )}
      
      {/* Channel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredStreams.map((channel) => {
          const { current, next } = getChannelPrograms(channel.stream_id);
          
          return (
            <ChannelCard
              key={channel.stream_id}
              channel={channel}
              currentProgram={current}
              nextProgram={next}
            />
          );
        })}
        
        {filteredStreams.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No channels found matching your search'
                : activeTab === 'favorites'
                ? 'No favorite channels yet. Add some by clicking the star icon on channels.'
                : 'No channels available in this category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}