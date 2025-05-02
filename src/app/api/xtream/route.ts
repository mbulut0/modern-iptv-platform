import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { server, username, password, action, params = {} } = body;
    
    console.log('API route received request:', { server, username, action, params });
    
    // Validate required parameters
    if (!server || !username || !password) {
      console.log('Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Format the server URL
    const baseURL = server.endsWith('/') ? server.slice(0, -1) : server;
    
    // Build the API URL
    let apiUrl = `${baseURL}/player_api.php?username=${username}&password=${password}`;
    
    // Add action if provided
    if (action) {
      apiUrl += `&action=${action}`;
    }
    
    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      apiUrl += `&${key}=${value}`;
    });
    
    console.log('Proxy request to:', apiUrl);
    
    // Make the request to the Xtream API
    const response = await axios.get(apiUrl);
    
    console.log('Xtream API response status:', response.status);
    console.log('Xtream API response data:', JSON.stringify(response.data).substring(0, 500) + '...');
    
    // Check if the response contains user_info for authentication
    if (!action && response.data && response.data.user_info) {
      console.log('Authentication successful, user info received');
    } else if (!response.data) {
      console.log('Warning: Empty response data from Xtream API');
    }
    
    // Return the response data
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Xtream API proxy error:', error);
    
    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorMessage = error.response?.data?.message || error.message;
      
      console.log('Axios error details:', {
        status,
        message: errorMessage,
        response: error.response?.data
      });
      
      return NextResponse.json(
        { error: `Xtream API error: ${errorMessage}` },
        { status }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}