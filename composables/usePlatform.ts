// Platform interface that all platforms must implement
export interface GamePlatform {
  id: string;               // Unique identifier for platform
  name: string;             // Display name
  icon: string;             // Path to platform icon
  color: string;            // Brand color
  isConnected: () => boolean; // Check if user has connected this platform
  connect: () => Promise<boolean>; // Connect user account
  disconnect: () => Promise<boolean>; // Disconnect user account
  getProfile: () => Promise<PlatformProfile | null>; // Get basic profile info
  getGames: () => Promise<PlatformGame[]>; // Get user's games
  getAchievements: (gameId: string) => Promise<PlatformAchievement[]>; // Get achievements for a game
}

// Common profile format across platforms
export interface PlatformProfile {
  platformId: string;      // Which platform (steam, epic, etc)
  platformUserId: string;  // User ID on that platform
  displayName: string;     // Username/display name
  avatarUrl?: string;      // Profile picture
  profileUrl?: string;     // URL to public profile
  connected: boolean;      // Connection status
  connectedAt: Date;       // When account was connected
}

// Common game format across platforms
export interface PlatformGame {
  platformId: string;      // Which platform the game is from
  gameId: string;          // Platform-specific game ID
  name: string;            // Game name
  imageUrl?: string;       // Game cover/icon
  lastPlayed?: Date;       // Last time played
  playtime?: number;       // Playtime in minutes
  stats?: Record<string, any>; // Platform-specific stats
}

// Common achievement format across platforms
export interface PlatformAchievement {
  platformId: string;      // Which platform
  gameId: string;          // Which game
  achievementId: string;   // Platform-specific achievement ID
  name: string;            // Achievement name
  description?: string;    // Achievement description
  iconUrl?: string;        // Achievement icon
  unlocked: boolean;       // Whether user has unlocked it
  unlockTime?: Date;       // When it was unlocked
  rarity?: number;         // How rare (percentage of players who unlocked)
}

// State management for connected platforms
export const usePlatforms = () => {
  const platforms: Ref<GamePlatform[]> = useState('platforms', () => []);
  const activePlatform: Ref<GamePlatform | null> = useState('activePlatform', () => null);
  
  // Register a platform with the system
  const registerPlatform = (platform: GamePlatform) => {
    const existingIndex = platforms.value.findIndex(p => p.id === platform.id);
    if (existingIndex >= 0) {
      platforms.value[existingIndex] = platform;
    } else {
      platforms.value.push(platform);
    }
    return platform;
  };
  
  // Get platform by ID
  const getPlatform = (platformId: string): GamePlatform | undefined => {
    return platforms.value.find(p => p.id === platformId);
  };
  
  // Set active platform
  const setActivePlatform = (platformId: string | null) => {
    if (platformId === null) {
      activePlatform.value = null;
      return;
    }
    
    const platform = getPlatform(platformId);
    if (platform) {
      activePlatform.value = platform;
    }
  };
  
  return {
    platforms,
    activePlatform,
    registerPlatform,
    getPlatform,
    setActivePlatform
  };
}; 