import { defineEventHandler, getRouterParam, createError } from 'h3';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';

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

interface SteamGame {
  appid: number;
  name: string;
  playtime_forever?: number;
  img_icon_url?: string;
  img_logo_url?: string;
  rtime_last_played?: number;
  [key: string]: any; // Allow for additional properties
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
    
    // Get the user's Steam ID if available
    const steamId = userData?.connectedAccounts?.steam?.steamId;
    
    if (!steamId) {
      console.warn(`Player ${playerId} does not have a connected Steam account`);
      return generateFallbackData(playerId);
    }
    
    console.log(`Found Steam ID ${steamId} for player ${playerId}`);
    
    // Get all achievement documents for this player using their Steam ID
    console.log(`Fetching achievements for player with Steam ID: ${steamId}`);
    
    // Query for documents where the ID starts with the steamId followed by an underscore
    const achievementsSnapshot = await db.collection('gameAchievements')
      .where('__name__', '>=', `${steamId}_`)
      .where('__name__', '<=', `${steamId}_\uf8ff`)
      .get();
    
    console.log(`Found ${achievementsSnapshot.size} achievement documents for player with Steam ID: ${steamId}`);
    
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
      // First, create a map of games to store all game data
      const gamesMap = new Map<string, GameData>();
      
      // Process each achievement document
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
        
        console.log(`Processing game ${gameId} (${data.gameName || 'Unknown Game'}) for player ${playerId}`);
        
        // Get or create game data
        let game = gamesMap.get(gameId);
        if (!game) {
          game = {
            gameId,
            gameName: data.gameName || 'Unknown Game',
            achievementsTotal: data.achievements.length,
            achievementsUnlocked: 0,
            lastPlayed: data.lastPlayed || null
          };
          gamesMap.set(gameId, game);
        }
        
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
      });
      
      // Try to fetch additional game information from Steam API
      try {
        // Get runtime config
        const config = useRuntimeConfig();
        const steamApiKey = config.steamApiKey;
        
        if (steamApiKey) {
          // Fetch owned games from Steam API
          const ownedGamesResponse = await axios.get(
            `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${steamApiKey}&steamid=${steamId}&include_appinfo=true`
          ).catch(error => {
            console.error('Error fetching owned games from Steam API:', error);
            return null;
          });
          
          if (ownedGamesResponse?.data?.response?.games) {
            const steamGames: SteamGame[] = ownedGamesResponse.data.response.games;
            console.log(`Found ${steamGames.length} games from Steam API`);
            
            // Update game information and add missing games
            steamGames.forEach((steamGame: SteamGame) => {
              const gameId = steamGame.appid.toString();
              let game = gamesMap.get(gameId);
              
              if (game) {
                // Update existing game with additional info
                game.gameName = game.gameName === `Game ${gameId}` ? steamGame.name : game.gameName;
                game.lastPlayed = game.lastPlayed || (steamGame.rtime_last_played || null);
              } else {
                // Add new game that wasn't in our achievements collection
                game = {
                  gameId,
                  gameName: steamGame.name,
                  achievementsTotal: 0, // We don't know if it has achievements
                  achievementsUnlocked: 0,
                  lastPlayed: steamGame.rtime_last_played || null
                };
                gamesMap.set(gameId, game);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching additional game information:', error);
      }
      
      // Convert the map to an array and add to player's games
      player.games = Array.from(gamesMap.values());
      
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
      
      // Sort games by achievement count (descending), then by last played (descending)
      player.games.sort((a, b) => {
        // First sort by achievements unlocked
        const achievementDiff = b.achievementsUnlocked - a.achievementsUnlocked;
        if (achievementDiff !== 0) return achievementDiff;
        
        // If same number of achievements, sort by last played
        const aLastPlayed = a.lastPlayed || 0;
        const bLastPlayed = b.lastPlayed || 0;
        return bLastPlayed - aLastPlayed;
      });
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