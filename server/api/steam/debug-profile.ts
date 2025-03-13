import { defineEventHandler, getQuery, parseCookies, createError } from 'h3';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import axios from 'axios';

export default defineEventHandler(async (event) => {
  // Get runtime config
  const config = useRuntimeConfig();
  
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
    
    // Get query parameters
    const query = getQuery(event);
    const gameId = query.gameId as string;
    
    // Collect debug information with proper typing
    interface GameInfo {
      gameId: string;
      hasAchievements?: boolean;
    }
    
    interface AchievementsInfo {
      success: boolean;
      gameName: string;
      achievementCount: number;
      sampleAchievement: any;
    }
    
    const debugInfo: {
      userId: string;
      steamId: string;
      profileInfo: any;
      gameInfo: GameInfo | null;
      achievementsInfo: AchievementsInfo | null;
      errors: string[];
      privacyInstructions?: string[];
    } = {
      userId,
      steamId,
      profileInfo: null,
      gameInfo: null,
      achievementsInfo: null,
      errors: []
    };
    
    // 1. Check Steam profile visibility
    try {
      const profileResponse = await axios.get(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${steamId}`
      );
      
      const playerProfile = profileResponse.data?.response?.players?.[0] || null;
      debugInfo.profileInfo = playerProfile;
      
      // Check communityvisibilitystate
      // 1 = Private, 2 = Friends Only, 3 = Public
      if (playerProfile?.communityvisibilitystate !== 3) {
        debugInfo.errors.push('Steam profile is not public. Set your profile to public in Steam privacy settings.');
      }
    } catch (error: any) {
      debugInfo.errors.push(`Error fetching profile: ${error.message}`);
    }
    
    // 2. If gameId is provided, check game-specific info
    if (gameId) {
      debugInfo.gameInfo = { gameId };
      
      // Try to get player achievements
      try {
        const achievementsResponse = await axios.get(
          `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${steamApiKey}&steamid=${steamId}&appid=${gameId}`
        );
        
        debugInfo.achievementsInfo = {
          success: achievementsResponse.data?.playerstats?.success || false,
          gameName: achievementsResponse.data?.playerstats?.gameName || '',
          achievementCount: achievementsResponse.data?.playerstats?.achievements?.length || 0,
          sampleAchievement: achievementsResponse.data?.playerstats?.achievements?.[0] || null
        };
        
        if (achievementsResponse.data?.playerstats?.success === false) {
          debugInfo.errors.push('Game achievements are not accessible. This might be due to privacy settings or the game not having achievements.');
        }
      } catch (error: any) {
        debugInfo.errors.push(`Error fetching achievements: ${error.message}`);
        
        // Try to get game schema to see if the game has achievements
        try {
          const schemaResponse = await axios.get(
            `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${steamApiKey}&appid=${gameId}`
          );
          
          const hasAchievements = schemaResponse.data?.game?.availableGameStats?.achievements?.length > 0;
          if (debugInfo.gameInfo) {
            debugInfo.gameInfo.hasAchievements = hasAchievements;
          }
          
          if (hasAchievements) {
            debugInfo.errors.push('Game has achievements, but your personal achievements are not accessible. Check your Steam privacy settings.');
          } else {
            debugInfo.errors.push('Game does not have achievements according to the schema.');
          }
        } catch (schemaError: any) {
          debugInfo.errors.push(`Error fetching game schema: ${schemaError.message}`);
        }
      }
    }
    
    // 3. Provide privacy setting instructions
    debugInfo.privacyInstructions = [
      'To fix privacy issues:',
      '1. Go to your Steam profile',
      '2. Click "Edit Profile"',
      '3. Go to "Privacy Settings"',
      '4. Set "My profile" to "Public"',
      '5. Set "Game details" to "Public"',
      '6. Click "Save"'
    ];
    
    return {
      debug: true,
      ...debugInfo,
      recommendations: debugInfo.errors.length > 0 
        ? ['Please check the errors and follow the privacy instructions.'] 
        : ['Your Steam profile appears to be correctly configured.']
    };
  } catch (error: any) {
    console.error('Error in debug-profile endpoint:', error);
    
    return createError({
      statusCode: 500,
      statusMessage: 'Error debugging profile: ' + (error.message || 'Unknown error')
    });
  }
}); 