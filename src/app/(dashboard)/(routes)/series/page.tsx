'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useContentStore } from '@/lib/store/content-store';
import { CategorySelector } from '@/components/ui/category-selector';
import { SeriesCard } from '@/components/ui/series-card';
import { Series } from '@/types';
import { useUserPreferencesStore } from '@/lib/store/user-preferences-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star, History, Clock } from 'lucide-react';

export default function SeriesPage() {
  const { credentials } = useAuthStore();
  const { 
    seriesCategories, 
    series, 
    selectedSeriesCategory,
    fetchSeries,
    setSelectedSeriesCategory
  } = useContentStore();
  const { favorites, watchHistory } = useUserPreferencesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Get series based on selected category or search
  const getFilteredSeries = (): Series[] => {
    let filteredSeries: Series[] = [];
    
    if (activeTab === 'favorites') {
      // Get favorite series
      const allSeries = Object.values(series).flat();
      filteredSeries = allSeries.filter(s => 
        favorites.series.includes(s.series_id)
      );
    } else if (activeTab === 'continue') {
      // Get series in progress
      const allSeries = Object.values(series).flat();
      const inProgressSeriesIds = watchHistory.series.map(item => item.id);
      filteredSeries = allSeries.filter(s => 
        inProgressSeriesIds.includes(s.series_id)
      );
      
      // Sort by last watched
      filteredSeries.sort((a, b) => {
        const aHistory = watchHistory.series.find(item => item.id === a.series_id);
        const bHistory = watchHistory.series.find(item => item.id === b.series_id);
        
        if (!aHistory || !bHistory) return 0;
        return new Date(bHistory.lastWatched).getTime() - new Date(aHistory.lastWatched).getTime();
      });
    } else if (selectedSeriesCategory && series[selectedSeriesCategory]) {
      // Get series for selected category
      filteredSeries = series[selectedSeriesCategory];
    } else if (series.all) {
      // Get all series
      filteredSeries = series.all;
    }
    
    // Apply search filter if needed
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredSeries = filteredSeries.filter(s => 
        s.name.toLowerCase().includes(query)
      );
    }
    
    return filteredSeries;
  };
  
  // Fetch series when category changes
  useEffect(() => {
    if (!credentials) return;
    
    // Fetch series for selected category
    if (selectedSeriesCategory) {
      if (!series[selectedSeriesCategory]) {
        fetchSeries(credentials, selectedSeriesCategory).catch(console.error);
      }
    } else if (!series.all) {
      // Fetch all series if not already loaded
      fetchSeries(credentials).catch(console.error);
    }
  }, [credentials, selectedSeriesCategory, series, fetchSeries]);
  
  const filteredSeries = getFilteredSeries();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">TV Series</h1>
      
      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All Series</TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="continue" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Continue Watching</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search series..."
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
            categories={seriesCategories}
            selectedCategoryId={selectedSeriesCategory}
            onSelectCategory={setSelectedSeriesCategory}
          />
        </div>
      )}
      
      {/* Series Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredSeries.map((series) => (
          <SeriesCard
            key={series.series_id}
            series={series}
          />
        ))}
        
        {filteredSeries.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No series found matching your search'
                : activeTab === 'favorites'
                ? 'No favorite series yet. Add some by clicking the star icon on series.'
                : activeTab === 'continue'
                ? 'No series in progress. Start watching to see them here.'
                : 'No series available in this category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}