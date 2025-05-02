'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/auth-store';
import { XtreamCredentials } from '@/types';

// Form validation schema
const loginSchema = z.object({
  server: z.string().min(1, 'Server URL is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, clearError, isAuthenticated } = useAuthStore();
  
  // Check if already authenticated
  useEffect(() => {
    console.log('LoginForm: Checking authentication status');
    if (isAuthenticated) {
      console.log('LoginForm: User is already authenticated, redirecting to dashboard');
      router.push('/live');
    }
  }, [isAuthenticated, router]);
  
  // Initialize form
  const form = useForm<XtreamCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      server: '',
      username: '',
      password: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: XtreamCredentials) => {
    setIsLoading(true);
    clearError();
    
    try {
      console.log('Login attempt with data:', data);
      
      // Format server URL if needed
      let serverUrl = data.server;
      if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
        serverUrl = `http://${serverUrl}`;
      }
      
      console.log('Formatted server URL:', serverUrl);
      
      // Attempt login
      const result = await login({
        ...data,
        server: serverUrl,
      });
      
      console.log('Login result:', result);
      
      // Check if authentication was successful
      const authState = useAuthStore.getState();
      console.log('Auth state after login:', {
        isAuthenticated: authState.isAuthenticated,
        hasUser: !!authState.user,
        hasCredentials: !!authState.credentials,
        error: authState.error
      });
      
      if (!authState.isAuthenticated) {
        throw new Error('Authentication failed: Invalid response from server');
      }
      
      console.log('Login successful, redirecting...');
      
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        // Check if authentication was successful
        const currentState = useAuthStore.getState();
        console.log('Current auth state after login:', {
          isAuthenticated: currentState.isAuthenticated,
          hasUser: !!currentState.user
        });
        
        // Redirect to dashboard on success
        router.push('/live');
      }, 500);
    } catch (error) {
      console.error('Login failed:', error);
      // Display error to user
      form.setError('server', { 
        type: 'manual', 
        message: error instanceof Error ? error.message : 'Authentication failed' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-none shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">IPTV Login</CardTitle>
          <CardDescription className="text-center">
            Enter your Xtream Codes account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => {
              e.preventDefault();
              console.log('Form submitted');
              const formData = form.getValues();
              console.log('Form values:', formData);
              onSubmit(formData);
            }} className="space-y-4">
              <FormField
                control={form.control}
                name="server"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Server URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="http://example.com:8080" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your username" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {error && (
                <div className="p-3 text-sm text-white bg-red-500 rounded-md">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                onClick={() => {
                  console.log('Login button clicked');
                  const formData = form.getValues();
                  console.log('Form values on click:', formData);
                }}
              >
                {isLoading ? 'Connecting...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>Enter your IPTV provider details to access content</p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}