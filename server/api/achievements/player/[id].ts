import { defineEventHandler, getRouterParam, createError } from 'h3';
import { getFirestore } from 'firebase-admin/firestore';

interface GameData {
  gameId: string;
  gameName: string;
  achievementsTotal: number;
  achievementsUnlocked: number;
  lastPlayed: number | null;
  playerName?: string;
}

interface PlayerData {
  userId: string;
  displayName: string | null;
  photoURL: string | null;
  email?: string | null;
  totalAchievements: number;
  unlockedAchievements: number;
  achievementRate: number;
  lastUnlocked: number;
  connectedAccounts?: any;
  games: GameData[];
}

export default defineEventHandler(async (event) => {
  try {
    console.log('Starting player profile API request');
    // Get player ID from route parameter
    const playerId = getRouterParam(event, 'id');
    
    if (!playerId) {
      console.warn('Player ID is missing in request');
      return generateFallbackData(playerId || 'unknown-player');
    }
    
    console.log(`Fetching player profile for ID: ${playerId}`);
    
    // Get Firestore instance
    const db = getFirestore();
    
    // Get user document
    const userDoc = await db.collection('users').doc(playerId).get();
    
    if (!userDoc.exists) {
      console.warn(`Player not found in database: ${playerId}`);
      return generateFallbackData(playerId);
    }
    
    const userData = userDoc.data() || {};
    console.log(`Found user document for ${playerId} with displayName: ${userData.displayName || 'null'}`);
    
    // Get all achievement documents for this player
    console.log(`Fetching achievements for player: ${playerId}`);
    const achievementsSnapshot = await db.collection('gameAchievements')
      .where('userId', '==', playerId)
      .get();
    
    console.log(`Found ${achievementsSnapshot.size} achievement documents for player: ${playerId}`);
    
    // Initialize player data
    const player: PlayerData = {
      userId: playerId,
      displayName: userData.displayName || null,
      photoURL: userData.photoURL || null,
      email: userData.email || null,
      totalAchievements: 0,
      unlockedAchievements: 0,
      achievementRate: 0,
      lastUnlocked: 0,
      games: []
    };
    
    // Add connected accounts if available
    if (userData.connectedAccounts) {
      player.connectedAccounts = userData.connectedAccounts;
      console.log(`Player has connected accounts: ${Object.keys(userData.connectedAccounts).join(', ')}`);
    }
    
    // Process achievement documents
    if (!achievementsSnapshot.empty) {
      achievementsSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Skip if no achievements array
        if (!Array.isArray(data.achievements)) {
          console.warn(`Achievement document ${doc.id} has no achievements array`);
          return;
        }
        
        // Extract game ID from document ID (format: userId_gameId)
        const gameId = doc.id.split('_')[1];
        
        if (!gameId) {
          console.warn(`Invalid document ID format: ${doc.id}`);
          return;
        }
        
        console.log(`Processing game ${gameId} (${data.gameName || 'Unknown Game'}) for player ${playerId}`);
        
        // Initialize game data
        const game: GameData = {
          gameId,
          gameName: data.gameName || 'Unknown Game',
          achievementsTotal: data.achievements.length,
          achievementsUnlocked: 0,
          lastPlayed: data.lastPlayed || null
        };
        
        // Count achievements
        player.totalAchievements += data.achievements.length;
        
        // Process each achievement
        data.achievements.forEach(achievement => {
          // Count unlocked achievements
          if (achievement.unlocked) {
            game.achievementsUnlocked += 1;
            player.unlockedAchievements += 1;
            
            // Update last unlock time
            if (achievement.unlockTime > player.lastUnlocked) {
              player.lastUnlocked = achievement.unlockTime;
            }
          }
        });
        
        // Add game to player's games
        player.games.push(game);
      });
      
      // If there are connected accounts, try to extract player names for games
      if (player.connectedAccounts) {
        if (player.connectedAccounts.steam && player.connectedAccounts.steam.personaName) {
          // For Steam games, add the Steam persona name as playerName if available
          const steamPersonaName = player.connectedAccounts.steam.personaName;
          player.games.forEach(game => {
            if (!game.playerName) {
              game.playerName = steamPersonaName;
            }
          });
        }
      }
      
      // Calculate achievement rate
      if (player.totalAchievements > 0) {
        player.achievementRate = (player.unlockedAchievements / player.totalAchievements) * 100;
      }
      
      // Sort games by achievement count (descending)
      player.games.sort((a, b) => b.achievementsUnlocked - a.achievementsUnlocked);
    } else {
      console.log(`No achievements found for player: ${playerId}`);
    }
    
    console.log(`Returning player profile with ${player.games.length} games and ${player.unlockedAchievements}/${player.totalAchievements} achievements`);
    return { player };
  } catch (error) {
    console.error('Error fetching player profile:', error);
    return generateFallbackData();
  }
});

// Helper function to generate fallback data
function generateFallbackData(userId: string = 'sample-user') {
  console.log(`Generating fallback data for user: ${userId}`);
  // Create a friendly username from the userId
  let friendlyName: string;
  let email: string | null = null;
  let steamId: string | null = null;
  
  if (userId === 'sample-user') {
    friendlyName = 'Sample Player';
  } else if (userId.includes('@')) {
    // If it's an email address, use it as the email field
    email = userId;
    // Extract the part before @ for the friendly name
    friendlyName = userId.split('@')[0];
    // Capitalize first letter and replace dots/underscores with spaces
    friendlyName = friendlyName.charAt(0).toUpperCase() + 
                  friendlyName.slice(1).replace(/[._]/g, ' ');
  } else if (userId.startsWith('765611') || userId.startsWith('7656119')) {
    // It's likely a Steam ID
    steamId = userId;
    friendlyName = `Steam Player ${userId.substring(userId.length - 4)}`;
  } else {
    // For other IDs, create a friendly gamer name
    friendlyName = `Gamer ${Math.floor(Math.random() * 1000)}`;
  }
  
  const steamName = `${friendlyName.replace(/\s+/g, '')}`;
  
  return {
    player: {
      userId: userId,
      displayName: friendlyName,
      email: email,
      photoURL: `https://api.dicebear.com/6.x/bottts/svg?seed=${userId}`,
      totalAchievements: 120,
      unlockedAchievements: 87,
      achievementRate: 72.5,
      lastUnlocked: Math.floor(Date.now() / 1000) - 86400 * 2, // 2 days ago
      connectedAccounts: {
        steam: steamId ? {
          steamId: steamId,
          personaName: steamName,
          avatarUrl: `https://api.dicebear.com/6.x/bottts/svg?seed=steam_${userId}`,
          profileUrl: `https://steamcommunity.com/profiles/${steamId}`,
          connectedAt: Math.floor(Date.now() / 1000) - 86400 * 30 // 30 days ago
        } : {
          steamId: "76561198291601112",
          personaName: steamName,
          avatarUrl: `https://api.dicebear.com/6.x/bottts/svg?seed=steam_${userId}`,
          profileUrl: "https://steamcommunity.com/id/vstolf/",
          connectedAt: Math.floor(Date.now() / 1000) - 86400 * 30 // 30 days ago
        }
      },
      games: [
        {
          gameId: '570',
          gameName: 'Dota 2',
          achievementsTotal: 50,
          achievementsUnlocked: 42,
          lastPlayed: Math.floor(Date.now() / 1000) - 86400 * 1, // 1 day ago
          playerName: steamName
        },
        {
          gameId: '730',
          gameName: 'Counter-Strike 2',
          achievementsTotal: 70,
          achievementsUnlocked: 45,
          lastPlayed: Math.floor(Date.now() / 1000) - 86400 * 3, // 3 days ago
          playerName: steamName
        }
      ]
    },
    isFallback: true
  };
} 