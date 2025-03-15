import { defineEventHandler, getQuery, createError } from 'h3';
import { getFirestore } from 'firebase-admin/firestore';

interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  iconUrl: string;
  iconGrayUrl?: string;
  unlocked: boolean;
  unlockTime?: number;
  globalPercentage?: number;
  id?: string;
  gameId?: string;
  gameName?: string;
  [key: string]: any; // Allow for additional properties
}

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event);
    const steamId = query.steamId as string;
    const limit = parseInt(query.limit as string) || 5;
    
    if (!steamId) {
      return createError({
        statusCode: 400,
        message: 'Steam ID is required'
      });
    }
    
    // Get Firestore instance
    const db = getFirestore();
    
    // Query for documents where the ID starts with the steamId followed by an underscore
    const achievementsSnapshot = await db.collection('gameAchievements')
      .where('__name__', '>=', `${steamId}_`)
      .where('__name__', '<=', `${steamId}_\uf8ff`)
      .get();
    
    console.log(`Found ${achievementsSnapshot.size} achievement documents for Steam ID: ${steamId}`);
    
    if (achievementsSnapshot.empty) {
      return {
        achievements: [],
        message: 'No achievements found'
      };
    }
    
    // Process all achievements from all games
    const allAchievements: Achievement[] = [];
    
    // Create a map to store game names by ID
    const gameNameMap = new Map<string, string>();
    
    achievementsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Skip if no achievements array
      if (!Array.isArray(data.achievements)) {
        console.warn(`Achievement document ${doc.id} has no achievements array`);
        return;
      }
      
      // Extract game ID from document ID (format: steamId_gameId)
      const docParts = doc.id.split('_');
      if (docParts.length < 2) {
        console.warn(`Invalid document ID format: ${doc.id}`);
        return;
      }
      
      // The gameId is everything after the first underscore
      const gameId = docParts.slice(1).join('_');
      
      if (!gameId) {
        console.warn(`Invalid document ID format: ${doc.id}`);
        return;
      }
      
      // Store the game name in our map
      const gameName = data.gameName || `Game ${gameId}`;
      gameNameMap.set(gameId, gameName);
      
      console.log(`Processing achievements for game ${gameId} (${gameName})`);
      
      // Process each achievement
      data.achievements.forEach((achievement: Achievement) => {
        if (achievement.unlocked) {
          allAchievements.push({
            ...achievement,
            id: `${achievement.achievementId}_${gameId}`,
            gameId,
            gameName
          });
        }
      });
    });
    
    console.log(`Found ${allAchievements.length} unlocked achievements across ${gameNameMap.size} games`);
    
    // Sort by unlock time (most recent first) and limit the results
    const recentAchievements = allAchievements
      .sort((a, b) => (b.unlockTime || 0) - (a.unlockTime || 0))
      .slice(0, limit);
    
    return {
      achievements: recentAchievements,
      total: allAchievements.length
    };
  } catch (error) {
    console.error('Error fetching recent achievements:', error);
    return createError({
      statusCode: 500,
      message: 'Failed to fetch recent achievements'
    });
  }
}); 