import { defineEventHandler, getQuery } from 'h3';
import axios from 'axios';
import { getFirebaseUser } from '~/server/utils/auth';
import { getFirestore } from 'firebase-admin/firestore';

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const user = await getFirebaseUser(event);
    if (!user) {
      return { statusCode: 401, body: { error: 'Unauthorized' } };
    }
    
    // Get game ID from query parameters
    const query = getQuery(event);
    const gameId = query.gameId as string;
    
    if (!gameId) {
      return { statusCode: 400, body: { error: 'Game ID is required' } };
    }
    
    // Get Steam ID from Firestore
    const userDoc = await getFirestore().collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      return { statusCode: 404, body: { error: 'User not found' } };
    }
    
    const userData = userDoc.data();
    const steamId = userData?.connectedAccounts?.steam?.steamId;
    
    if (!steamId) {
      return { statusCode: 400, body: { error: 'Steam account not connected' } };
    }
    
    // First get global achievements to get names and descriptions
    const steamApiKey = process.env.STEAM_API_KEY;
    const globalAchievementsResponse = await axios.get(
      `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${steamApiKey}&appid=${gameId}`
    );
    
    const globalAchievements = globalAchievementsResponse.data.game?.availableGameStats?.achievements || [];
    
    // Then get user's achievements
    const userAchievementsResponse = await axios.get(
      `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${steamApiKey}&steamid=${steamId}&appid=${gameId}`
    );
    
    const userAchievements = userAchievementsResponse.data.playerstats?.achievements || [];
    
    // Get global achievement stats for rarity information
    const achievementStatsResponse = await axios.get(
      `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${gameId}`
    );
    
    const achievementStats = achievementStatsResponse.data.achievementpercentages?.achievements || [];
    
    // Merge global and user achievement data
    const mergedAchievements = userAchievements.map((userAchievement: any) => {
      const globalAchievement = globalAchievements.find((a: any) => a.name === userAchievement.apiname);
      const stats = achievementStats.find((a: any) => a.name === userAchievement.apiname);
      
      return {
        ...userAchievement,
        name: globalAchievement?.displayName || userAchievement.apiname,
        description: globalAchievement?.description || '',
        icon: globalAchievement?.icon || '',
        percent: stats?.percent || 0
      };
    });
    
    return {
      achievements: mergedAchievements
    };
  } catch (error) {
    console.error('Error fetching Steam achievements:', error);
    return { statusCode: 500, body: { error: 'Internal server error' } };
  }
}); 