import { typeGamePlatform, typePlatformProfile, typePlatformGame, typePlatformAchievement, usePlatforms } from './usePlatform';
import { useAuth } from './useAuth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Steam API requires a server-side component due to API key security
export const useSteamPlatform = () => {
  const { user } = useAuth();
  const { registerPlatform } = usePlatforms();
  const { $firestore } = useNuxtApp();
  const firestore = $firestore;
  
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Check if user has connected their Steam account
  const isConnected = (): boolean => {
    if (!user.value) return false;
    const steamData = user.value.providerData?.find(p => p.providerId === 'steam.com');
    return !!steamData;
  };
  
  // Initiate Steam connection flow
  const connect = async (): Promise<boolean> => {
    if (!user.value) return false;
    
    try {
      loading.value = true;
      error.value = null;
      
      // Steam uses OpenID, not OAuth directly, which requires server-side handling
      // We'll redirect to our server endpoint that handles the Steam authentication
      window.location.href = '/api/connect-steam';
      
      return true; // Note: This will actually redirect, not return
    } catch (err: any) {
      console.error('Error connecting Steam account:', err);
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  // Disconnect Steam account
  const disconnect = async (): Promise<boolean> => {
    if (!user.value || !isConnected()) return false;
    
    try {
      loading.value = true;
      error.value = null;
      
      // Remove Steam data from Firestore user profile
      const userRef = doc(firestore, 'users', user.value.uid);
      await updateDoc(userRef, {
        'connectedAccounts.steam': null
      });
      
      return true;
    } catch (err: any) {
      console.error('Error disconnecting Steam account:', err);
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  // Get Steam profile data
  const getProfile = async (): Promise<PlatformProfile | null> => {
    if (!user.value || !isConnected()) return null;
    
    try {
      loading.value = true;
      error.value = null;
      
      // In a real implementation, get this from Firestore where it was stored
      // during the connection process
      const userRef = doc(firestore, 'users', user.value.uid);
      const userData = await getDoc(userRef);
      
      if (!userData.exists() || !userData.data().connectedAccounts?.steam) {
        return null;
      }
      
      const steamData = userData.data().connectedAccounts.steam;
      
      return {
        platformId: 'steam',
        platformUserId: steamData.steamId,
        displayName: steamData.personaName,
        avatarUrl: steamData.avatarUrl,
        profileUrl: steamData.profileUrl,
        connected: true,
        connectedAt: steamData.connectedAt.toDate()
      };
    } catch (err: any) {
      console.error('Error getting Steam profile:', err);
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  // Get user's Steam games
  const getGames = async (): Promise<PlatformGame[]> => {
    if (!user.value || !isConnected()) return [];
    
    try {
      loading.value = true;
      error.value = null;
      
      // Call our API endpoint that fetches games from Steam API
      const response = await fetch('/api/steam/games');
      if (!response.ok) {
        throw new Error(`Error fetching Steam games: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform data to our common format
      return data.games.map((game: any) => ({
        platformId: 'steam',
        gameId: game.appid.toString(),
        name: game.name,
        imageUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
        lastPlayed: game.last_played ? new Date(game.last_played * 1000) : undefined,
        playtime: game.playtime_forever,
        stats: {
          playtime_2weeks: game.playtime_2weeks
        }
      }));
    } catch (err: any) {
      console.error('Error getting Steam games:', err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  // Get achievements for a specific game
  const getAchievements = async (gameId: string): Promise<PlatformAchievement[]> => {
    if (!user.value || !isConnected()) return [];
    
    try {
      loading.value = true;
      error.value = null;
      
      // Call our API endpoint that fetches achievements from Steam API
      const response = await fetch(`/api/steam/achievements?gameId=${gameId}`);
      if (!response.ok) {
        throw new Error(`Error fetching Steam achievements: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform to our common format
      return data.achievements.map((achievement: any) => ({
        platformId: 'steam',
        gameId,
        achievementId: achievement.apiname,
        name: achievement.name,
        description: achievement.description,
        iconUrl: achievement.icon,
        unlocked: achievement.achieved === 1,
        unlockTime: achievement.unlocktime ? new Date(achievement.unlocktime * 1000) : undefined,
        rarity: achievement.percent
      }));
    } catch (err: any) {
      console.error('Error getting Steam achievements:', err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  // Create and register the Steam platform
  const steamPlatform: GamePlatform = {
    id: 'steam',
    name: 'Steam',
    icon: '/icons/steam.svg',
    color: '#171a21',
    isConnected,
    connect,
    disconnect,
    getProfile,
    getGames,
    getAchievements
  };
  
  // Register this platform with our platform manager
  registerPlatform(steamPlatform);
  
  return {
    steamPlatform,
    loading,
    error
  };
}; 