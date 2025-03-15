import { defineEventHandler, getQuery, parseCookies, createError } from 'h3';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export default defineEventHandler(async (event) => {
  try {
    console.log('Starting community achievements API request');
    // Get Firestore instance
    const db = getFirestore();
    
    // First, get all users to ensure we have their profile data
    console.log('Fetching all users from Firestore');
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.warn('No users found in Firestore');
      return {
        users: [],
        totalAchievements: 0
      };
    }
    
    // Map to store user data
    const usersMap = new Map<string, {
      userId: string,
      displayName: string | null,
      photoURL: string | null,
      email?: string | null,
      totalAchievements: number,
      unlockedAchievements: number,
      achievementRate: number,
      lastUnlocked: number,
      connectedAccounts?: any,
      games: Map<string, {
        gameId: string,
        gameName: string,
        achievementsTotal: number,
        achievementsUnlocked: number,
        lastPlayed?: number,
        playerName?: string
      }>
    }>();
    
    // Initialize users map with profile data
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const userId = userData.uid || doc.id;
      
      if (!userId) {
        console.warn(`User document ${doc.id} has no uid field`);
        return;
      }
      
      usersMap.set(userId, {
        userId,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        email: userData.email || null,
        totalAchievements: 0,
        unlockedAchievements: 0,
        achievementRate: 0,
        lastUnlocked: 0,
        connectedAccounts: userData.connectedAccounts || undefined,
        games: new Map()
      });
      
      console.log(`Added user ${userId} to users map with displayName: ${userData.displayName || 'null'}`);
    });
    
    // Map to track all unique achievements
    const allAchievements = new Set<string>();
    
    // Get all game achievements documents
    console.log('Fetching all game achievements from Firestore');
    const achievementsSnapshot = await db.collection('gameAchievements').get();
    
    if (achievementsSnapshot.empty) {
      console.warn('No achievements found in Firestore');
      // Return users with empty achievements
      const users = Array.from(usersMap.values()).map(user => ({
        ...user,
        games: []
      }));
      
      return {
        users,
        totalAchievements: 0
      };
    }
    
    // Process each achievement document
    console.log(`Processing ${achievementsSnapshot.size} achievement documents`);
    achievementsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Skip if no achievements array
      if (!Array.isArray(data.achievements)) {
        console.warn(`Achievement document ${doc.id} has no achievements array`);
        return;
      }
      
      // Extract user ID and game ID from document ID (format: userId_gameId)
      const [userId, gameId] = doc.id.split('_');
      
      if (!userId || !gameId) {
        console.warn(`Invalid document ID format: ${doc.id}`);
        return;
      }
      
      // Initialize user if not exists (this should be rare since we already loaded all users)
      if (!usersMap.has(userId)) {
        console.log(`Creating new user entry for ${userId} not found in users collection`);
        usersMap.set(userId, {
          userId,
          displayName: null,
          photoURL: null,
          totalAchievements: 0,
          unlockedAchievements: 0,
          achievementRate: 0,
          lastUnlocked: 0,
          games: new Map()
        });
      }
      
      const user = usersMap.get(userId)!;
      
      // Initialize game if not exists
      if (!user.games.has(gameId)) {
        user.games.set(gameId, {
          gameId,
          gameName: data.gameName || 'Unknown Game',
          achievementsTotal: 0,
          achievementsUnlocked: 0,
          lastPlayed: data.lastPlayed || null
        });
      }
      
      const game = user.games.get(gameId)!;
      
      // Count achievements
      game.achievementsTotal += data.achievements.length;
      user.totalAchievements += data.achievements.length;
      
      // Track all unique achievements
      data.achievements.forEach((achievement: any) => {
        const achievementId = `${achievement.achievementId}_${gameId}`;
        allAchievements.add(achievementId);
        
        // Count unlocked achievements
        if (achievement.unlocked) {
          game.achievementsUnlocked += 1;
          user.unlockedAchievements += 1;
          
          // Update last unlock time
          if (achievement.unlockTime > user.lastUnlocked) {
            user.lastUnlocked = achievement.unlockTime;
          }
        }
      });
      
      // Calculate achievement rate
      if (game.achievementsTotal > 0) {
        game.achievementsUnlocked = Math.min(game.achievementsUnlocked, game.achievementsTotal);
      }
    });
    
    // Calculate achievement rates for all users
    usersMap.forEach(user => {
      if (user.totalAchievements > 0) {
        user.achievementRate = (user.unlockedAchievements / user.totalAchievements) * 100;
      }
    });
    
    // Add player names from connected accounts
    usersMap.forEach(user => {
      if (user.connectedAccounts && user.connectedAccounts.steam && user.connectedAccounts.steam.personaName) {
        const steamPersonaName = user.connectedAccounts.steam.personaName;
        user.games.forEach(game => {
          if (!game.playerName) {
            game.playerName = steamPersonaName;
          }
        });
      }
    });
    
    // Convert maps to arrays and sort users by achievement count
    const users = Array.from(usersMap.values())
      .map(user => ({
        ...user,
        games: Array.from(user.games.values())
      }))
      .filter(user => user.games.length > 0) // Only include users with games
      .sort((a, b) => b.unlockedAchievements - a.unlockedAchievements);
    
    console.log(`Returning ${users.length} users with achievements`);
    
    // Return the user-focused data
    return {
      users,
      totalAchievements: allAchievements.size
    };
  } catch (error) {
    console.error('Error fetching community achievements:', error);
    
    // Helper function to create a friendly name
    const createFriendlyName = (userId: string, displayName?: string | null): string => {
      if (displayName && displayName.trim() !== '') return displayName;
      
      if (userId.includes('@')) {
        // If it's an email address, use the part before @
        const name = userId.split('@')[0];
        // Capitalize first letter and replace dots/underscores with spaces
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._]/g, ' ');
      } else if (userId.startsWith('765611') || userId.startsWith('7656119')) {
        // It's likely a Steam ID, create a friendly Steam username
        return `Steam Player ${userId.substring(userId.length - 4)}`;
      } else {
        // For other IDs, create a friendly gamer name
        return `Gamer ${Math.floor(Math.random() * 1000)}`;
      }
    };
    
    // For demo purposes, return sample data if the API fails
    return {
      isFallback: true,
      users: [
        {
          userId: 'user1',
          displayName: 'GamerPro99',
          email: 'gamer.pro99@example.com',
          photoURL: 'https://api.dicebear.com/6.x/bottts/svg?seed=GamerPro99',
          totalAchievements: 120,
          unlockedAchievements: 87,
          achievementRate: 72.5,
          lastUnlocked: Math.floor(Date.now() / 1000) - 86400 * 2, // 2 days ago
          connectedAccounts: {
            steam: {
              steamId: '76561198291601112',
              personaName: 'GamerPro99',
              avatarUrl: 'https://api.dicebear.com/6.x/bottts/svg?seed=steam_GamerPro99',
              profileUrl: 'https://steamcommunity.com/id/gamerpro99/',
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
              playerName: 'GamerPro99'
            },
            {
              gameId: '730',
              gameName: 'Counter-Strike 2',
              achievementsTotal: 70,
              achievementsUnlocked: 45,
              lastPlayed: Math.floor(Date.now() / 1000) - 86400 * 3, // 3 days ago
              playerName: 'GamerPro99'
            }
          ]
        },
        {
          userId: 'user2',
          displayName: 'AchievementHunter',
          email: 'achievement.hunter@example.com',
          photoURL: 'https://api.dicebear.com/6.x/bottts/svg?seed=AchievementHunter',
          totalAchievements: 150,
          unlockedAchievements: 65,
          achievementRate: 43.3,
          lastUnlocked: Math.floor(Date.now() / 1000) - 86400 * 5, // 5 days ago
          games: [
            {
              gameId: '570',
              gameName: 'Dota 2',
              achievementsTotal: 50,
              achievementsUnlocked: 15,
              lastPlayed: Math.floor(Date.now() / 1000) - 86400 * 7 // 7 days ago
            },
            {
              gameId: '440',
              gameName: 'Team Fortress 2',
              achievementsTotal: 100,
              achievementsUnlocked: 50,
              lastPlayed: Math.floor(Date.now() / 1000) - 86400 * 5 // 5 days ago
            }
          ]
        },
        {
          userId: 'user3',
          displayName: 'CasualGamer',
          photoURL: 'https://api.dicebear.com/6.x/bottts/svg?seed=CasualGamer',
          totalAchievements: 80,
          unlockedAchievements: 25,
          achievementRate: 31.25,
          lastUnlocked: Math.floor(Date.now() / 1000) - 86400 * 10, // 10 days ago
          games: [
            {
              gameId: '730',
              gameName: 'Counter-Strike 2',
              achievementsTotal: 70,
              achievementsUnlocked: 20,
              lastPlayed: Math.floor(Date.now() / 1000) - 86400 * 12 // 12 days ago
            },
            {
              gameId: '271590',
              gameName: 'Grand Theft Auto V',
              achievementsTotal: 10,
              achievementsUnlocked: 5,
              lastPlayed: Math.floor(Date.now() / 1000) - 86400 * 10 // 10 days ago
            }
          ]
        }
      ],
      totalAchievements: 350
    };
  }
}); 