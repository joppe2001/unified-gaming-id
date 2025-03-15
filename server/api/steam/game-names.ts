import { defineEventHandler, getQuery, createError } from 'h3';
import axios from 'axios';
import { getFirestore } from 'firebase-admin/firestore';

// Cache for game names to avoid repeated API calls
const gameNameCache = new Map<string, string>();

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event);
    const gameId = query.gameId as string;
    const forceRefresh = query.forceRefresh === 'true';
    
    if (!gameId) {
      return createError({
        statusCode: 400,
        message: 'Game ID is required'
      });
    }
    
    // Check if we already have the game name in our cache
    if (!forceRefresh && gameNameCache.has(gameId)) {
      console.log(`Returning cached game name for ${gameId}: ${gameNameCache.get(gameId)}`);
      return {
        gameId,
        name: gameNameCache.get(gameId)
      };
    }
    
    // Get Firestore instance
    const db = getFirestore();
    
    // Check if we have the game name in Firestore
    const gameDoc = await db.collection('gameNames').doc(gameId).get();
    
    if (gameDoc.exists && !forceRefresh) {
      const data = gameDoc.data();
      if (data && data.name && data.name !== 'Unknown Game' && data.name !== `Game ${gameId}`) {
        // Store in cache
        gameNameCache.set(gameId, data.name);
        console.log(`Returning Firestore game name for ${gameId}: ${data.name}`);
        return {
          gameId,
          name: data.name,
          source: 'firestore'
        };
      }
    }
    
    // Get runtime config
    const config = useRuntimeConfig();
    const steamApiKey = config.steamApiKey;
    
    if (!steamApiKey) {
      return createError({
        statusCode: 500,
        message: 'Steam API key not configured'
      });
    }
    
    // Try to get the game name from the Steam Store API
    try {
      console.log(`Fetching game name for ${gameId} from Steam Store API`);
      const storeResponse = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${gameId}`);
      
      if (storeResponse.data && storeResponse.data[gameId] && storeResponse.data[gameId].success) {
        const gameName = storeResponse.data[gameId].data.name;
        
        // Store in cache
        gameNameCache.set(gameId, gameName);
        
        // Store in Firestore for future use
        await db.collection('gameNames').doc(gameId).set({
          name: gameName,
          updatedAt: Date.now()
        });
        
        console.log(`Retrieved and stored game name for ${gameId}: ${gameName}`);
        return {
          gameId,
          name: gameName,
          source: 'steam_store'
        };
      }
    } catch (storeError) {
      console.error(`Error fetching game name from Steam Store for ${gameId}:`, storeError);
    }
    
    // If Steam Store API fails, try the Steam API
    try {
      console.log(`Fetching game name for ${gameId} from Steam API`);
      const apiResponse = await axios.get(
        `https://api.steampowered.com/ISteamApps/GetAppList/v2/?key=${steamApiKey}`
      );
      
      if (apiResponse.data && apiResponse.data.applist && apiResponse.data.applist.apps) {
        const apps = apiResponse.data.applist.apps;
        const app = apps.find((app: any) => app.appid.toString() === gameId);
        
        if (app && app.name) {
          // Store in cache
          gameNameCache.set(gameId, app.name);
          
          // Store in Firestore for future use
          await db.collection('gameNames').doc(gameId).set({
            name: app.name,
            updatedAt: Date.now()
          });
          
          console.log(`Retrieved and stored game name for ${gameId}: ${app.name}`);
          return {
            gameId,
            name: app.name,
            source: 'steam_api'
          };
        }
      }
    } catch (apiError) {
      console.error(`Error fetching game name from Steam API for ${gameId}:`, apiError);
    }
    
    // If all else fails, return a default name
    const defaultName = `Game ${gameId}`;
    gameNameCache.set(gameId, defaultName);
    
    console.log(`Could not find game name for ${gameId}, using default: ${defaultName}`);
    return {
      gameId,
      name: defaultName,
      source: 'default'
    };
  } catch (error) {
    console.error('Error in game-names API:', error);
    return createError({
      statusCode: 500,
      message: 'Failed to fetch game name'
    });
  }
}); 