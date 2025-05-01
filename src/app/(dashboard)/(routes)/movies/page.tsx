'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useContentStore } from '@/lib/store/content-store';
import { CategorySelector } from '@/components/ui/category-selector';
import { MovieCard } from '@/components/ui/movie-card';
import { Movie } from '@/types';
import { useUserPreferencesStore } from '@/lib/store/user-preferences-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star, History, Clock } from 'lucide-react';

export default function MoviesPage() {
  const { credentials } = useAuthStore();
  const { 
    movieCategories, 
    movies, 
    selectedMovieCategory,
    fetchMovies,
    setSelectedMovieCategory
  } = useContentStore();
  const { favorites, watchHistory } = useUserPreferencesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Get movies based on selected category or search
  const getFilteredMovies = (): Movie[] => {
    let filteredMovies: Movie[] = [];
    
    if (activeTab === 'favorites') {
      // Get favorite movies
      const allMovies = Object.values(movies).flat();
      filteredMovies = allMovies.filter(movie => 
        favorites.movies.includes(movie.stream_id)
      );
    } else if (activeTab === 'recent') {
      // Get recently watched movies
      const allMovies = Object.values(movies).flat();
      const recentMovieIds = watchHistory.movies.map(item => item.id);
      filteredMovies = allMovies.filter(movie => 
        recentMovieIds.includes(movie.stream_id)
      );
      
      // Sort by last watched
      filteredMovies.sort((a, b) => {
        const aHistory = watchHistory.movies.find(item => item.id === a.stream_id);
        const bHistory = watchHistory.movies.find(item => item.id === b.stream_id);
        
        if (!aHistory || !bHistory) return 0;
        return new Date(bHistory.lastWatched).getTime() - new Date(aHistory.lastWatched).getTime();
      });
    } else if (selectedMovieCategory && movies[selectedMovieCategory]) {
      // Get movies for selected category
      filteredMovies = movies[selectedMovieCategory];
    } else if (movies.all) {
      // Get all movies
      filteredMovies = movies.all;
    }
    
    // Apply search filter if needed
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredMovies = filteredMovies.filter(movie => 
        movie.name.toLowerCase().includes(query)
      );
    }
    
    return filteredMovies;
  };
  
  // Fetch movies when category changes
  useEffect(() => {
    if (!credentials) return;
    
    // Fetch movies for selected category
    if (selectedMovieCategory) {
      if (!movies[selectedMovieCategory]) {
        fetchMovies(credentials, selectedMovieCategory).catch(console.error);
      }
    } else if (!movies.all) {
      // Fetch all movies if not already loaded
      fetchMovies(credentials).catch(console.error);
    }
  }, [credentials, selectedMovieCategory, movies, fetchMovies]);
  
  const filteredMovies = getFilteredMovies();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Movies</h1>
      
      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All Movies</TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              <span>Recent</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search movies..."
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
            categories={movieCategories}
            selectedCategoryId={selectedMovieCategory}
            onSelectCategory={setSelectedMovieCategory}
          />
        </div>
      )}
      
      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredMovies.map((movie) => (
          <MovieCard
            key={movie.stream_id}
            movie={movie}
          />
        ))}
        
        {filteredMovies.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No movies found matching your search'
                : activeTab === 'favorites'
                ? 'No favorite movies yet. Add some by clicking the star icon on movies.'
                : activeTab === 'recent'
                ? 'No recently watched movies. Start watching to see them here.'
                : 'No movies available in this category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}