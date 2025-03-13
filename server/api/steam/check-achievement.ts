import { defineEventHandler, getQuery, parseCookies, createError } from 'h3';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import axios from 'axios';

export default defineEventHandler(async (event) => {
  // Get runtime config
  const config = useRuntimeConfig();
  
  // Get query parameters
  const query = getQuery(event);
  const gameId = query.gameId as string;
  const achievementId = query.achievementId as string;
  
  if (!gameId) {
    return createError({
      statusCode: 400,
      statusMessage: 'Game ID is required'
    });
  }
  
  if (!achievementId) {
    return createError({
      statusCode: 400,
      statusMessage: 'Achievement ID is required'
    });
  }
  
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
    
    // Get Steam API key from runtime config
    const steamApiKey = config.public.steamApiKey;
    
    if (!steamApiKey) {
      return createError({
        statusCode: 500,
        statusMessage: 'Steam API key not configured'
      });
    }
    
    // Make direct API calls to Steam to check achievement status
    
    // 1. Get player achievements
    const achievementsResponse = await axios.get(
      `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${steamApiKey}&steamid=${steamId}&appid=${gameId}`
    ).catch(error => {
      console.error('Error fetching player achievements:', error.response?.data || error.message);
      return null;
    });
    
    // 2. Get achievement schema
    const schemaResponse = await axios.get(
      `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${steamApiKey}&appid=${gameId}`
    ).catch(error => {
      console.error('Error fetching achievement schema:', error.response?.data || error.message);
      return null;
    });
    
    // 3. Get global achievement stats
    const globalStatsResponse = await axios.get(
      `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${gameId}`
    ).catch(error => {
      console.error('Error fetching global achievement stats:', error.response?.data || error.message);
      return null;
    });
    
    // Process and return the results
    const playerAchievements = achievementsResponse?.data?.playerstats?.achievements || [];
    const achievementSchema = schemaResponse?.data?.game?.availableGameStats?.achievements || [];
    const globalAchievements = globalStatsResponse?.data?.achievementpercentages?.achievements || [];
    
    // Find the specific achievement
    const playerAchievement = playerAchievements.find((a: any) => a.apiname === achievementId);
    const schemaAchievement = achievementSchema.find((a: any) => a.name === achievementId);
    const globalAchievement = globalAchievements.find((a: any) => a.name === achievementId);
    
    // Return detailed information about the achievement
    return {
      achievement: {
        id: achievementId,
        name: schemaAchievement?.displayName || achievementId,
        description: schemaAchievement?.description || 'No description available',
        iconUrl: schemaAchievement?.icon || '',
        iconGrayUrl: schemaAchievement?.icongray || '',
        unlocked: playerAchievement?.achieved === 1,
        unlockTime: playerAchievement?.unlocktime || 0,
        globalPercentage: globalAchievement?.percent || 0
      },
      rawData: {
        playerAchievement: playerAchievement || null,
        schemaAchievement: schemaAchievement || null,
        globalAchievement: globalAchievement || null,
        apiSuccess: achievementsResponse?.data?.playerstats?.success || false
      }
    };
  } catch (error: any) {
    console.error('Error checking Steam achievement:', error);
    
    return createError({
      statusCode: 500,
      statusMessage: 'Error checking achievement: ' + (error.message || 'Unknown error')
    });
  }
}); 