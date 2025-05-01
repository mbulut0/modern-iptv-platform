'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUserPreferencesStore } from '@/lib/store/user-preferences-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Trash2, Clock, Calendar, Server, User, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function ProfilePage() {
  const router = useRouter();
  const { user, credentials, logout } = useAuthStore();
  const { 
    clearWatchHistory, 
    clearFavorites,
    watchHistory,
    favorites
  } = useUserPreferencesStore();
  
  const [clearHistoryDialog, setClearHistoryDialog] = useState(false);
  const [clearFavoritesDialog, setClearFavoritesDialog] = useState(false);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  // Handle clear watch history
  const handleClearHistory = () => {
    clearWatchHistory();
    setClearHistoryDialog(false);
  };
  
  // Handle clear favorites
  const handleClearFavorites = () => {
    clearFavorites();
    setClearFavoritesDialog(false);
  };
  
  // Format expiration date
  const formatExpirationDate = () => {
    if (!user?.exp_date) return 'Unknown';
    
    try {
      // Xtream API typically returns Unix timestamp
      const expDate = new Date(parseInt(user.exp_date) * 1000);
      return expDate.toLocaleDateString();
    } catch (error) {
      return user.exp_date;
    }
  };
  
  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.username) return 'U';
    return user.username.substring(0, 2).toUpperCase();
  };
  
  // Calculate watch statistics
  const getWatchStats = () => {
    const moviesWatched = watchHistory.movies.length;
    const episodesWatched = watchHistory.series.reduce((total, series) => {
      return total + series.watchedEpisodes.length;
    }, 0);
    const channelsWatched = watchHistory.channels.length;
    
    return {
      moviesWatched,
      episodesWatched,
      channelsWatched,
      totalWatched: moviesWatched + episodesWatched + channelsWatched
    };
  };
  
  // Calculate favorites statistics
  const getFavoriteStats = () => {
    return {
      favoriteChannels: favorites.channels.length,
      favoriteMovies: favorites.movies.length,
      favoriteSeries: favorites.series.length,
      totalFavorites: favorites.channels.length + favorites.movies.length + favorites.series.length
    };
  };
  
  const watchStats = getWatchStats();
  const favoriteStats = getFavoriteStats();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User info card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user?.username || 'User'}</CardTitle>
              <CardDescription>Account Information</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[20px_1fr] items-start gap-2 text-sm">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Username</p>
                <p className="text-muted-foreground">{user?.username || 'Unknown'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-[20px_1fr] items-start gap-2 text-sm">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Subscription Expires</p>
                <p className="text-muted-foreground">{formatExpirationDate()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-[20px_1fr] items-start gap-2 text-sm">
              <Server className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Server</p>
                <p className="text-muted-foreground truncate">{credentials?.server || 'Unknown'}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </CardFooter>
        </Card>
        
        {/* Statistics */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Your viewing activity and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="watch-history">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="watch-history" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Watch History
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center">
                  <Star className="mr-2 h-4 w-4" />
                  Favorites
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="watch-history" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Movies Watched</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{watchStats.moviesWatched}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Episodes Watched</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{watchStats.episodesWatched}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Channels Watched</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{watchStats.channelsWatched}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Dialog open={clearHistoryDialog} onOpenChange={setClearHistoryDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Watch History
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear Watch History</DialogTitle>
                      <DialogDescription>
                        This will permanently delete your entire watch history. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setClearHistoryDialog(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleClearHistory}>
                        Clear History
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>
              
              <TabsContent value="favorites" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Favorite Movies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{favoriteStats.favoriteMovies}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Favorite Series</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{favoriteStats.favoriteSeries}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Favorite Channels</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{favoriteStats.favoriteChannels}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Dialog open={clearFavoritesDialog} onOpenChange={setClearFavoritesDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All Favorites
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear Favorites</DialogTitle>
                      <DialogDescription>
                        This will permanently delete all your favorites. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setClearFavoritesDialog(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleClearFavorites}>
                        Clear Favorites
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}