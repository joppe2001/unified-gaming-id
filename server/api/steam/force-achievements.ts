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
  const bypassPrivacy = query.bypassPrivacy === 'true';
  
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
    
    // Fetch achievements from Steam API
    const achievementsResponse = await axios.get(
      `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${steamApiKey}&steamid=${steamId}&appid=${gameId}`
    ).catch(error => {
      console.error('Error fetching achievements:', error.response?.data || error.message);
      return null;
    });
    
    // Check if achievements are available
    if (!achievementsResponse || achievementsResponse.data?.playerstats?.success === false) {
      if (!bypassPrivacy) {
        return {
          error: 'Cannot access achievements. This might be due to privacy settings.',
          isPrivate: true,
          achievements: []
        };
      }
      
      // If bypassPrivacy is true, we'll continue with global achievements
      console.log('Bypassing privacy check and using global achievements');
    }
    
    // Get achievement schema for additional details like icons
    const schemaResponse = await axios.get(
      `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${steamApiKey}&appid=${gameId}`
    ).catch(error => {
      console.error('Error fetching schema:', error.response?.data || error.message);
      return null;
    });
    
    const achievementSchema = schemaResponse?.data?.game?.availableGameStats?.achievements || [];
    
    // Get global achievement stats for rarity information
    const globalStatsResponse = await axios.get(
      `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${gameId}`
    ).catch(error => {
      console.error('Error fetching global stats:', error.response?.data || error.message);
      return null;
    });
    
    const globalAchievements = globalStatsResponse?.data?.achievementpercentages?.achievements || [];
    
    // If we have player achievements, merge them with schema and global stats
    if (achievementsResponse && achievementsResponse.data?.playerstats?.success !== false) {
      const achievements = achievementsResponse.data?.playerstats?.achievements || [];
      
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
          timestamp: new Date(),
          isPrivate: false
        })
        .catch(error => console.log('Error caching achievements:', error));
      
      return {
        achievements: mergedAchievements,
        isPrivate: false,
        forced: true
      };
    } 
    // If we don't have player achievements but bypassPrivacy is true, use schema and global stats
    else if (bypassPrivacy && achievementSchema.length > 0) {
      // Get cached achievements first
      const cachedAchievementsDoc = await db.collection('gameAchievements')
        .doc(`${steamId}_${gameId}`)
        .get()
        .catch(() => null);
      
      const cachedAchievements = cachedAchievementsDoc?.exists ? 
        cachedAchievementsDoc.data()?.achievements || [] : [];
      
      // Create achievement objects with global stats
      const achievements = achievementSchema.map((schema: any) => {
        const globalStat = globalAchievements.find((a: any) => a.name === schema.name);
        const cachedAchievement = cachedAchievements.find((a: any) => a.achievementId === schema.name);
        
        return {
          achievementId: schema.name,
          name: schema.displayName || schema.name,
          description: schema.description || 'No description available',
          iconUrl: schema.icon || '',
          iconGrayUrl: schema.icongray || '',
          unlocked: cachedAchievement?.unlocked || false, // Use cached status if available
          unlockTime: cachedAchievement?.unlockTime || 0,
          globalPercentage: globalStat?.percent || 0,
          bypassedPrivacy: true // Flag to indicate these are not directly from Steam API
        };
      });
      
      // Cache the results in Firestore
      await db.collection('gameAchievements')
        .doc(`${steamId}_${gameId}`)
        .set({
          achievements,
          timestamp: new Date(),
          isPrivate: true,
          bypassedPrivacy: true
        })
        .catch(error => console.log('Error caching achievements:', error));
      
      return {
        achievements,
        isPrivate: true,
        bypassedPrivacy: true,
        forced: true
      };
    }
    
    // No achievements available at all
    return {
      achievements: [],
      error: 'No achievements available for this game',
      forced: true
    };
  } catch (error: any) {
    console.error('Error forcing Steam achievements:', error);
    
    return createError({
      statusCode: 500,
      statusMessage: 'Error forcing achievements: ' + (error.message || 'Unknown error')
    });
  }
}); 