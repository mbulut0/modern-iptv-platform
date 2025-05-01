'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useSettingsStore } from '@/lib/store/settings-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Sun, Moon, Monitor, Lock, Volume2, Sliders, Globe, Info } from 'lucide-react';

export default function SettingsPage() {
  const { theme: currentTheme, setTheme } = useTheme();
  const { 
    bufferSize, 
    setBufferSize,
    autoPlay,
    setAutoPlay,
    defaultVolume,
    setDefaultVolume,
    language,
    setLanguage,
    parentalControl,
    setParentalControl,
    parentalPin,
    setParentalPin
  } = useSettingsStore();
  
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Handle theme change
  const handleThemeChange = (theme: string) => {
    setTheme(theme);
  };
  
  // Handle buffer size change
  const handleBufferSizeChange = (value: number[]) => {
    setBufferSize(value[0]);
    toast.success(`Buffer size set to ${value[0]} seconds`);
  };
  
  // Handle default volume change
  const handleVolumeChange = (value: number[]) => {
    setDefaultVolume(value[0]);
  };
  
  // Handle language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    toast.success(`Language set to ${value}`);
  };
  
  // Handle parental control toggle
  const handleParentalControlToggle = (checked: boolean) => {
    if (checked && !parentalPin) {
      // If enabling but no PIN is set, don't enable yet
      toast.error('Please set a PIN first');
      return;
    }
    
    setParentalControl(checked);
    toast.success(`Parental control ${checked ? 'enabled' : 'disabled'}`);
  };
  
  // Handle PIN save
  const handleSavePin = () => {
    // Validate PIN
    if (pin.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }
    
    if (pin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }
    
    setParentalPin(pin);
    setPinError('');
    setPin('');
    setConfirmPin('');
    toast.success('PIN saved successfully');
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <Tabs defaultValue="appearance">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 h-auto">
          <TabsTrigger value="appearance" className="flex items-center">
            <Sun className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="playback" className="flex items-center">
            <Sliders className="mr-2 h-4 w-4" />
            Playback
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center">
            <Globe className="mr-2 h-4 w-4" />
            Language
          </TabsTrigger>
          <TabsTrigger value="parental" className="flex items-center">
            <Lock className="mr-2 h-4 w-4" />
            Parental Control
          </TabsTrigger>
        </TabsList>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={currentTheme === 'light' ? 'default' : 'outline'}
                  className="flex flex-col items-center justify-center h-24 gap-2"
                  onClick={() => handleThemeChange('light')}
                >
                  <Sun className="h-6 w-6" />
                  <span>Light</span>
                </Button>
                
                <Button
                  variant={currentTheme === 'dark' ? 'default' : 'outline'}
                  className="flex flex-col items-center justify-center h-24 gap-2"
                  onClick={() => handleThemeChange('dark')}
                >
                  <Moon className="h-6 w-6" />
                  <span>Dark</span>
                </Button>
                
                <Button
                  variant={currentTheme === 'system' ? 'default' : 'outline'}
                  className="flex flex-col items-center justify-center h-24 gap-2"
                  onClick={() => handleThemeChange('system')}
                >
                  <Monitor className="h-6 w-6" />
                  <span>System</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Playback Settings */}
        <TabsContent value="playback" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Playback Settings</CardTitle>
              <CardDescription>
                Configure how videos play in the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-play">Auto Play</Label>
                  <Switch
                    id="auto-play"
                    checked={autoPlay}
                    onCheckedChange={setAutoPlay}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically play videos when opening content
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="buffer-size">Buffer Size ({bufferSize} seconds)</Label>
                <Slider
                  id="buffer-size"
                  min={5}
                  max={60}
                  step={5}
                  value={[bufferSize]}
                  onValueChange={handleBufferSizeChange}
                />
                <p className="text-sm text-muted-foreground">
                  Larger buffer helps with playback on slower connections but uses more memory
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-volume">Default Volume ({Math.round(defaultVolume * 100)}%)</Label>
                <Slider
                  id="default-volume"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[defaultVolume]}
                  onValueChange={handleVolumeChange}
                />
                <p className="text-sm text-muted-foreground">
                  Set the default volume level for video playback
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Language Settings */}
        <TabsContent value="language" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Language Settings</CardTitle>
              <CardDescription>
                Choose your preferred language for the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Interface Language</Label>
                <Select
                  value={language}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="tr">Türkçe</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Note: Language support is limited in the current version
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Parental Control Settings */}
        <TabsContent value="parental" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Parental Control</CardTitle>
              <CardDescription>
                Restrict access to mature content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="parental-control">Enable Parental Control</Label>
                  <Switch
                    id="parental-control"
                    checked={parentalControl}
                    onCheckedChange={handleParentalControlToggle}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, PIN will be required to access mature content
                </p>
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="parental-pin">Parental Control PIN</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      id="parental-pin"
                      type="password"
                      placeholder="Enter PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      PIN must be at least 4 digits
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Confirm PIN"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                    />
                  </div>
                </div>
                
                {pinError && (
                  <p className="text-sm text-destructive">{pinError}</p>
                )}
                
                <Button onClick={handleSavePin}>
                  Save PIN
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-4 w-4" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">IPTV Platform</span> - Version 1.0.0
          </p>
          <p className="text-sm text-muted-foreground">
            A modern IPTV/OTT platform built with Next.js and TypeScript.
          </p>
          <p className="text-sm text-muted-foreground">
            This application uses TMDB API for additional content information.
          </p>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} IPTV Platform. All rights reserved.
        </CardFooter>
      </Card>
    </div>
  );
}