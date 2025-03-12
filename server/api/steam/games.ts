import { defineEventHandler, parseCookies, createError } from 'h3';
import axios from 'axios';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export default defineEventHandler(async (event) => {
  // Get Firebase ID token from cookies to identify the user
  const cookies = parseCookies(event);
  const idToken = cookies.idToken;
  
  if (!idToken) {
    return createError({
      statusCode: 401,
      statusMessage: 'Not authenticated'
    });
  }
  
  try {
    // Verify the token and get user
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    // Get Firestore instance
    const db = getFirestore();
    
    // Get user document to retrieve Steam ID
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }
    
    const userData = userDoc.data();
    const steamId = userData?.connectedAccounts?.steam?.steamId;
    
    if (!steamId) {
      return createError({
        statusCode: 400,
        statusMessage: 'Steam account not connected'
      });
    }
    
    // Get Steam API key from environment variables
    const steamApiKey = process.env.STEAM_API_KEY;
    
    if (!steamApiKey) {
      return createError({
        statusCode: 500,
        statusMessage: 'Steam API key not configured'
      });
    }
    
    // Call Steam API with error handling
    const response = await axios.get(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${steamApiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`
    ).catch(error => {
      console.log(`Error fetching games for user ${steamId}:`, error.message);
      // Return null to indicate error but continue execution
      return null;
    });
    
    // Check if response is valid
    if (!response || !response.data || !response.data.response) {
      console.log(`Invalid response from Steam API for user ${steamId}`);
      return {
        games: []
      };
    }
    
    // Get recently played games for additional data
    const recentGamesResponse = await axios.get(
      `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${steamApiKey}&steamid=${steamId}`
    ).catch(error => {
      console.log(`Error fetching recent games for user ${steamId}:`, error.message);
      return null;
    });
    
    const recentGames = recentGamesResponse?.data?.response?.games || [];
    const recentGamesMap: Record<number, { playtime_2weeks: number }> = {};
    
    // Create a map of recent games for quick lookup
    recentGames.forEach((game: any) => {
      recentGamesMap[game.appid] = {
        playtime_2weeks: game.playtime_2weeks
      };
    });
    
    // Process games data
    const games = response.data.response.games || [];
    
    // Enhance games with additional data
    const enhancedGames = games.map((game: any) => ({
      ...game,
      // Add recent playtime if available
      playtime_2weeks: recentGamesMap[game.appid]?.playtime_2weeks || 0,
      // Convert playtime to minutes if it's not already
      playtime_forever: game.playtime_forever || 0,
      // Add last played timestamp if available
      last_played: game.last_played_time || null
    }));
    
    return {
      games: enhancedGames
    };
  } catch (error: any) {
    console.error('Error fetching Steam games:', error);
    
    // Check if the error is related to Firestore not being enabled
    if (error.message?.includes('PERMISSION_DENIED') && error.message?.includes('Cloud Firestore API has not been used')) {
      return createError({
        statusCode: 500,
        statusMessage: 'Firestore API is not enabled'
      });
    }
    
    // Handle Steam API errors
    if (error.response?.status === 403) {
      return createError({
        statusCode: 403,
        statusMessage: 'Steam API key invalid or unauthorized'
      });
    }
    
    return createError({
      statusCode: 500,
      statusMessage: 'Error fetching Steam games'
    });
  }
}); 