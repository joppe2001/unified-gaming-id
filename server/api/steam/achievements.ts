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
  const forceRefresh = query.forceRefresh === 'true';
  
  if (!gameId) {
    return createError({
      statusCode: 400,
      statusMessage: 'Game ID is required'
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
    
    // First, check if we have cached achievements in Firestore
    const cachedAchievementsDoc = await db.collection('gameAchievements')
      .doc(`${steamId}_${gameId}`)
      .get()
      .catch(() => null);
    
    if (!forceRefresh && cachedAchievementsDoc?.exists) {
      const cachedData = cachedAchievementsDoc.data() || {};
      // Only use cache if it's less than 24 hours old
      const cacheTime = cachedData.timestamp?.toDate() || new Date(0);
      const cacheAge = Date.now() - cacheTime.getTime();
      
      if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours in milliseconds
        
        // Ensure the cached achievements array is valid
        const cachedAchievements = Array.isArray(cachedData.achievements) ? cachedData.achievements : [];
        
        return {
          achievements: cachedAchievements,
          cached: true,
          isPrivate: !!cachedData.isPrivate
        };
      }
    }
    
    // Try to get game details first to check if the game exists and has achievements
    const gameDetailsResponse = await axios.get(
      `https://store.steampowered.com/api/appdetails?appids=${gameId}`
    ).catch(error => {
      return null;
    });
    
    const gameDetails = gameDetailsResponse?.data?.[gameId]?.data;
    const hasAchievements = gameDetails?.achievements?.total > 0;
    
    if (gameDetailsResponse && !hasAchievements) {
      return {
        achievements: [],
        hasAchievements: false
      };
    }
    
    // Fetch achievements from Steam API
    const achievementsResponse = await axios.get(
      `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${steamApiKey}&steamid=${steamId}&appid=${gameId}`
    ).catch(error => {
      return null;
    });
    
    // Check if achievements are available
    if (!achievementsResponse || achievementsResponse.data?.playerstats?.success === false) {
      
      // Try to get global achievement stats instead
      const globalStatsResponse = await axios.get(
        `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${gameId}`
      ).catch(error => {
        return null;
      });
      
      if (globalStatsResponse && globalStatsResponse.data?.achievementpercentages?.achievements?.length > 0) {
        // Game has achievements, but user's achievements are private or not available
        // Get achievement schema for details
        const schemaResponse = await axios.get(
          `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${steamApiKey}&appid=${gameId}`
        ).catch(error => {
          return null;
        });
        
        const achievementSchema = schemaResponse?.data?.game?.availableGameStats?.achievements || [];
        const globalAchievements = globalStatsResponse.data.achievementpercentages.achievements;
        
        // Create achievement objects with global stats
        const achievements = achievementSchema.map((schema: any) => {
          const globalStat = globalAchievements.find((a: any) => a.name === schema.name);
          
          return {
            achievementId: schema.name,
            name: schema.displayName || schema.name,
            description: schema.description || 'No description available',
            iconUrl: schema.icon || '',
            iconGrayUrl: schema.icongray || '',
            unlocked: false, // We don't know if user has unlocked it
            unlockTime: 0,
            globalPercentage: globalStat?.percent || 0,
            isPrivate: true // Flag to indicate these are not user-specific achievements
          };
        });
        
        // Cache the results in Firestore
        await db.collection('gameAchievements')
          .doc(`${steamId}_${gameId}`)
          .set({
            achievements,
            timestamp: new Date(),
            isPrivate: true
          })
          .catch(error => console.log('Error caching achievements:', error));
        
        return {
          achievements,
          isPrivate: true
        };
      }
      
      // No achievements available at all
      return {
        achievements: []
      };
    }
    
    const achievements = achievementsResponse.data?.playerstats?.achievements || [];
    
    // Get achievement schema for additional details like icons
    const schemaResponse = await axios.get(
      `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${steamApiKey}&appid=${gameId}`
    ).catch(error => {
      return null;
    });
    
    const achievementSchema = schemaResponse?.data?.game?.availableGameStats?.achievements || [];
    
    // Get global achievement stats for rarity information
    const globalStatsResponse = await axios.get(
      `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${gameId}`
    ).catch(error => {
      return null;
    });
    
    const globalAchievements = globalStatsResponse?.data?.achievementpercentages?.achievements || [];
    
    // Merge achievement data with schema data and global stats
    const mergedAchievements = achievements.map((achievement: any) => {
      const schemaAchievement = achievementSchema.find((a: any) => a.name === achievement.apiname);
      const globalStat = globalAchievements.find((a: any) => a.name === achievement.apiname);
      
      return {
        achievementId: achievement.apiname,
        name: schemaAchievement?.displayName || achievement.apiname,
        description: schemaAchievement?.description || 'No description available',
        iconUrl: schemaAchievement?.icon || '',
        iconGrayUrl: schemaAchievement?.icongray || '',
        unlocked: achievement.achieved === 1,
        unlockTime: achievement.unlocktime,
        globalPercentage: globalStat?.percent || 0
      };
    });
    
    // Cache the results in Firestore
    await db.collection('gameAchievements')
      .doc(`${steamId}_${gameId}`)
      .set({
        achievements: mergedAchievements,
        timestamp: new Date()
      })
      .catch(error => console.log('Error caching achievements:', error));
    
    return {
      achievements: mergedAchievements
    };
  } catch (error: any) {
    console.error('Error fetching Steam achievements:', error);
    
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
    
    // For demo purposes, return sample data if the API fails
    return {
      achievements: [
        {
          achievementId: 'ACH_WIN_ONE_GAME',
          name: 'First Victory',
          description: 'Win your first match',
          iconUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/570/d4f85b1d9797f45d4d13f92a6a2104bd7b2a8b8e.jpg',
          iconGrayUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/570/9c2968822b92b44c11cca5741ae2ce90323111f5.jpg',
          unlocked: true,
          unlockTime: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
          globalPercentage: 78.5
        },
        {
          achievementId: 'ACH_WIN_100_GAMES',
          name: 'Master Strategist',
          description: 'Win 100 matches',
          iconUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/570/9c2968822b92b44c11cca5741ae2ce90323111f5.jpg',
          iconGrayUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/570/9c2968822b92b44c11cca5741ae2ce90323111f5.jpg',
          unlocked: false,
          unlockTime: 0,
          globalPercentage: 12.3
        },
        {
          achievementId: 'ACH_COLLECT_50_ITEMS',
          name: 'Collector',
          description: 'Collect 50 unique items',
          iconUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/570/a89b8bb6764375d0a0534ff4e5faf4298c0731d3.jpg',
          iconGrayUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/570/a89b8bb6764375d0a0534ff4e5faf4298c0731d3.jpg',
          unlocked: true,
          unlockTime: Math.floor(Date.now() / 1000) - 86400 * 15, // 15 days ago
          globalPercentage: 45.7
        }
      ],
      isFallback: true
    };
  }
}); 