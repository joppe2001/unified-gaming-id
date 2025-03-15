<template>
  <div class="min-h-screen bg-gray-900 bg-opacity-95 p-4 text-white">
    <!-- Background elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Animated grid lines -->
      <div class="absolute inset-0 bg-grid-gaming opacity-10"></div>
      
      <!-- Glowing orbs -->
      <div class="glow-orb absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-500 opacity-10 blur-3xl"></div>
      <div class="glow-orb-delayed absolute bottom-1/3 left-1/3 w-96 h-96 rounded-full bg-purple-600 opacity-10 blur-3xl"></div>
    </div>

    <div class="container mx-auto py-6 px-4 sm:py-8 sm:px-6 lg:px-8 relative z-10">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold gaming-text text-blue-300 mb-2">Player Profile</h1>
          <p class="text-gray-400">Viewing gaming achievements for this player</p>
        </div>
        <div class="flex space-x-3 mt-4 md:mt-0">
          <NuxtLink to="/achievements" class="py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition border border-gray-700 relative overflow-hidden group">
            <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 group-hover:-translate-x-full"></span>
            Back to Leaderboard
          </NuxtLink>
          <NuxtLink to="/dashboard" class="py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition border border-gray-700 relative overflow-hidden group">
            <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 group-hover:-translate-x-full"></span>
            Dashboard
          </NuxtLink>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-10">
        <div class="loading-spinner mb-4">
          <div class="spinner-inner"></div>
        </div>
        <p class="text-xl text-blue-400">Loading player profile...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center">
        <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-red-300">Failed to load player profile</h3>
        <p class="mt-2 text-sm text-gray-300">{{ errorMessage }}</p>
        <button @click="fetchPlayerProfile" class="mt-4 py-2 px-4 bg-red-800 hover:bg-red-700 text-white rounded-md transition">
          Try Again
        </button>
      </div>

      <!-- Content -->
      <div v-else-if="player">
        <!-- Fallback Data Notice -->
        <div v-if="isFallback" class="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-6 text-yellow-300 flex items-center">
          <svg class="h-6 w-6 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-medium">Showing sample data</p>
            <p class="text-sm text-yellow-400">This player profile contains placeholder data because the actual player data couldn't be retrieved.</p>
          </div>
        </div>
        
        <!-- Player Profile Card -->
        <div class="bg-gray-800 bg-opacity-70 rounded-xl shadow-glow border border-gray-700 overflow-hidden backdrop-blur-sm mb-8">
          <div class="relative">
            <!-- Profile Banner -->
            <div class="h-32 bg-gradient-to-r from-blue-900 to-indigo-900 relative overflow-hidden">
              <!-- Decorative elements -->
              <div class="absolute top-0 right-0 w-24 h-24 bg-blue-400 rounded-full opacity-20 blur-lg pulse-slow"></div>
              <div class="absolute bottom-0 left-0 w-32 h-32 bg-purple-400 rounded-full opacity-20 blur-lg pulse-slow-delayed"></div>
              
              <!-- Grid overlay -->
              <div class="absolute inset-0 bg-grid-gaming opacity-30"></div>
            </div>
            
            <!-- Profile Avatar -->
            <div class="absolute bottom-0 left-8 transform translate-y-1/2 flex items-end">
              <div class="relative">
                <template v-if="!avatarImageError">
                  <img 
                    :src="player.photoURL || `https://api.dicebear.com/6.x/bottts/svg?seed=${player.displayName || player.userId}`" 
                    :alt="player.displayName || 'Player'" 
                    class="w-24 h-24 rounded-full border-4 border-gray-800 object-cover shadow-glow"
                    @error="handleAvatarImageError"
                  />
                </template>
                <div v-else class="w-24 h-24 rounded-full border-4 border-gray-800 bg-gray-700 flex items-center justify-center shadow-glow">
                  <svg class="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div class="absolute inset-0 rounded-full border-2 border-blue-400 opacity-50 animate-pulse"></div>
              </div>
              <div class="ml-4 mb-4">
                <h2 class="text-2xl font-bold text-white">{{ getUserDisplayName(player) }}</h2>
                <p class="text-gray-400 text-sm">Last active {{ formatDate(player.lastUnlocked) }}</p>
              </div>
            </div>
          </div>
          
          <div class="pt-16 pb-6 px-6">
            <!-- Achievement Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div class="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                <div class="flex items-center">
                  <div class="p-2 rounded-md bg-blue-900/50 border border-blue-700 mr-3">
                    <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-400">Achievements Unlocked</p>
                    <p class="text-xl font-bold text-white">{{ player.unlockedAchievements }} <span class="text-sm text-gray-400">of {{ player.totalAchievements }}</span></p>
                  </div>
                </div>
              </div>
              
              <div class="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                <div class="flex items-center">
                  <div class="p-2 rounded-md bg-green-900/50 border border-green-700 mr-3">
                    <svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-400">Completion Rate</p>
                    <div>
                      <p class="text-xl font-bold" :class="getCompletionTextClass(player.achievementRate)">{{ formatPercentage(player.achievementRate) }}%</p>
                      <div class="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                        <div class="h-1.5 rounded-full" :style="`width: ${player.achievementRate}%`" :class="getCompletionColorClass(player.achievementRate)"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                <div class="flex items-center">
                  <div class="p-2 rounded-md bg-purple-900/50 border border-purple-700 mr-3">
                    <svg class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-400">Games Played</p>
                    <p class="text-xl font-bold text-white">{{ player.games.length }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Games Section -->
        <div class="mb-8">
          <h3 class="text-xl font-bold text-blue-300 mb-4 gaming-text">Games</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="game in player.games" :key="game.gameId" class="bg-gray-800 bg-opacity-70 rounded-xl shadow-glow border border-gray-700 overflow-hidden backdrop-blur-sm">
              <div class="h-24 bg-gray-900 overflow-hidden">
                <template v-if="!game.imageError">
                  <img 
                    :src="`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.gameId}/header.jpg`" 
                    :alt="game.gameName" 
                    class="h-full w-full object-cover"
                    @error="handleGameImageError($event, game)"
                  />
                </template>
                <div v-else class="h-full w-full flex items-center justify-center bg-gray-800">
                  <span class="text-xs text-gray-400 text-center px-2">Image Unavailable</span>
                </div>
              </div>
              <div class="p-4">
                <h4 class="text-lg font-medium text-blue-300 mb-1">{{ game.gameName }}</h4>
                <div class="flex justify-between items-center mb-2">
                  <p class="text-sm text-gray-400">Achievements</p>
                  <p class="text-sm font-medium text-white">{{ game.achievementsUnlocked }} / {{ game.achievementsTotal }}</p>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2 mb-3">
                  <div 
                    class="h-2 rounded-full" 
                    :class="getCompletionColorClass(game.achievementsTotal > 0 ? (game.achievementsUnlocked / game.achievementsTotal) * 100 : 0)"
                    :style="`width: ${game.achievementsTotal > 0 ? (game.achievementsUnlocked / game.achievementsTotal) * 100 : 0}%`"
                  ></div>
                </div>
                <p v-if="game.lastPlayed" class="text-xs text-gray-400">Last played {{ formatDate(game.lastPlayed) }}</p>
              </div>
            </div>
            
            <div v-if="player.games.length === 0" class="col-span-full text-center py-8 bg-gray-800 bg-opacity-70 rounded-xl shadow-glow border border-gray-700">
              <p class="text-gray-400">No games found for this player</p>
            </div>
          </div>
        </div>
        
        <!-- Recent Achievements Section -->
        <div>
          <h3 class="text-xl font-bold text-blue-300 mb-4 gaming-text">Recent Achievements</h3>
          
          <div class="bg-gray-800 bg-opacity-70 rounded-xl shadow-glow border border-gray-700 overflow-hidden backdrop-blur-sm">
            <div v-if="recentAchievements.length > 0" class="divide-y divide-gray-700 max-h-[400px] overflow-y-auto">
              <div v-for="achievement in recentAchievements" :key="achievement.id" class="p-4 hover:bg-gray-700/50 transition-colors">
                <div class="flex items-start">
                  <div class="flex-shrink-0 h-12 w-12 bg-gray-900 rounded-md overflow-hidden border border-gray-700 mr-4">
                    <template v-if="!achievement.imageError">
                      <img 
                        :src="achievement.iconUrl" 
                        :alt="achievement.name" 
                        class="h-full w-full object-cover"
                        @error="handleAchievementImageError($event, achievement)"
                      />
                    </template>
                    <div v-else class="h-full w-full flex items-center justify-center bg-gray-800">
                      <span class="text-xs text-gray-400 text-center px-2">Image Unavailable</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="flex justify-between">
                      <p class="font-medium text-blue-300">{{ achievement.name }}</p>
                      <span :class="getRarityClass(achievement.globalPercentage)" class="px-2 py-0.5 text-xs rounded-full">
                        {{ formatPercentage(achievement.globalPercentage) }}%
                      </span>
                    </div>
                    <p class="text-sm text-gray-400 mt-1">{{ achievement.description }}</p>
                    <div class="flex justify-between mt-2">
                      <p class="text-xs text-gray-500">{{ achievement.gameName }}</p>
                      <p class="text-xs text-gray-500">Unlocked {{ formatDate(achievement.unlockTime) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="p-8 text-center">
              <p class="text-gray-400">No achievements unlocked yet</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Player Not Found -->
      <div v-else-if="!loading && !error" class="bg-gray-800 bg-opacity-70 rounded-xl shadow-glow border border-gray-700 overflow-hidden backdrop-blur-sm p-8 text-center">
        <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 class="mt-4 text-xl font-medium text-blue-300">Player Not Found</h3>
        <p class="mt-2 text-gray-400">The player you're looking for doesn't exist or has no achievements</p>
        <NuxtLink to="/achievements" class="mt-6 inline-flex items-center px-4 py-2 border border-blue-700 text-sm font-medium rounded-md text-blue-300 bg-blue-900/50 hover:bg-blue-800/50 transition-colors">
          Back to Leaderboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const playerId = route.params.id;

// State
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const player = ref(null);
const isFallback = ref(false);
const avatarImageError = ref(false);

// Mock achievement data for the player
const recentAchievements = computed(() => {
  if (!player.value) return [];
  
  // In a real app, you would fetch this data from the API
  // For now, we'll generate some mock achievements
  const achievements = [];
  
  // Add 5 mock achievements
  for (let i = 0; i < 5; i++) {
    achievements.push({
      id: `achievement_${i}`,
      name: `Achievement ${i + 1}`,
      description: `This is a mock achievement description for achievement ${i + 1}`,
      iconUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/570/d4f85b1d9797f45d4d13f92a6a2104bd7b2a8b8e.jpg',
      globalPercentage: Math.random() * 100,
      gameName: player.value.games[0]?.gameName || 'Unknown Game',
      unlockTime: Math.floor(Date.now() / 1000) - (86400 * i), // i days ago
      imageError: false
    });
  }
  
  return achievements;
});

// Fetch player profile
const fetchPlayerProfile = async () => {
  loading.value = true;
  error.value = false;
  isFallback.value = false;
  avatarImageError.value = false;
  
  try {
    console.log(`Fetching player profile for ID: ${playerId}`);
    // Call the API endpoint to get player data
    const response = await fetch(`/api/achievements/player/${playerId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch player profile: ${response.statusText}`);
    }
    
    const data = await response.json();
    player.value = data.player;
    isFallback.value = !!data.isFallback;
    
    if (isFallback.value) {
      console.warn('Received fallback data for player profile');
    } else if (player.value) {
      console.log(`Loaded player profile with ${player.value.games.length} games and ${player.value.unlockedAchievements}/${player.value.totalAchievements} achievements`);
      
      // Initialize imageError property for each game
      if (player.value.games && Array.isArray(player.value.games)) {
        player.value.games.forEach(game => {
          game.imageError = false;
        });
      }
    } else {
      console.warn('No player data returned from API');
    }
    
    loading.value = false;
  } catch (err) {
    console.error('Error fetching player profile:', err);
    error.value = true;
    errorMessage.value = err.message || 'Failed to load player profile';
    loading.value = false;
  }
};

// Format percentage with 1 decimal place
const formatPercentage = (value) => {
  return value ? parseFloat(value).toFixed(1) : '0.0';
};

// Get CSS class based on completion rate
const getCompletionColorClass = (percentage) => {
  if (percentage >= 90) return 'bg-green-500';
  if (percentage >= 70) return 'bg-blue-500';
  if (percentage >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

// Get text color class based on completion rate
const getCompletionTextClass = (percentage) => {
  if (percentage >= 90) return 'text-green-400';
  if (percentage >= 70) return 'text-blue-400';
  if (percentage >= 40) return 'text-yellow-400';
  return 'text-red-400';
};

// Get CSS class based on achievement rarity
const getRarityClass = (percentage) => {
  if (percentage <= 3) return 'bg-red-900/50 text-red-300 border border-red-700';
  if (percentage <= 10) return 'bg-purple-900/50 text-purple-300 border border-purple-700';
  if (percentage <= 50) return 'bg-blue-900/50 text-blue-300 border border-blue-700';
  return 'bg-green-900/50 text-green-300 border border-green-700';
};

// Format date from timestamp
const formatDate = (timestamp) => {
  if (!timestamp) return 'Never';
  
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  // Less than a minute
  if (diff < 60) return 'Just now';
  
  // Less than an hour
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a week
  if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  // Format as date
  const date = new Date(timestamp * 1000);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

// Handle image loading errors
const handleImageError = (event) => {
  event.target.src = '/images/achievement-placeholder.png';
};

// Handle game image loading errors
const handleGameImageError = (event, game) => {
  // Set a flag on the game object to indicate the image failed to load
  game.imageError = true;
  
  // We don't need to set the src since we're using v-if/v-else
  // event.target.src = '/images/game-placeholder.jpg';
};

// Handle achievement image loading errors
const handleAchievementImageError = (event, achievement) => {
  // Set a flag on the achievement object to indicate the image failed to load
  achievement.imageError = true;
};

// Handle avatar image loading errors
const handleAvatarImageError = () => {
  avatarImageError.value = true;
};

// Get user display name (prioritize display name, then Steam name, then other game service names)
const getUserDisplayName = (user) => {
  if (!user) return '';
  
  // 1. First priority: Use the displayName if available
  if (user.displayName && user.displayName.trim() !== '') {
    return user.displayName;
  }
  
  // 2. Second priority: Check if we have an email
  if (user.email) {
    // If we have an email, use the part before @
    const name = user.email.split('@')[0];
    // Capitalize first letter and replace dots/underscores with spaces
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._]/g, ' ');
  }
  
  // 3. Third priority: Check connected accounts
  if (user.connectedAccounts) {
    // Check for Steam username
    if (user.connectedAccounts.steam && user.connectedAccounts.steam.personaName) {
      return `${user.connectedAccounts.steam.personaName} (Steam)`;
    }
    
    // Check for Riot username
    if (user.connectedAccounts.riot && user.connectedAccounts.riot.gameName) {
      return `${user.connectedAccounts.riot.gameName} (Riot)`;
    }
  }
  
  // 4. Fourth priority: Check if there's a game with a player name
  if (user.games && user.games.length > 0) {
    for (const game of user.games) {
      if (game.playerName) {
        return `${game.playerName} (${game.gameName})`;
      }
    }
  }
  
  // 5. Fifth priority: Create a friendly name from the userId
  if (user.userId && user.userId.includes('@')) {
    // If userId is an email address, use the part before @
    const name = user.userId.split('@')[0];
    // Capitalize first letter and replace dots/underscores with spaces
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._]/g, ' ');
  }
  
  // 6. Sixth priority: Handle Steam IDs
  // Check if we have a steamId in connectedAccounts
  if (user.connectedAccounts && user.connectedAccounts.steam && user.connectedAccounts.steam.steamId) {
    return `Steam Player ${user.connectedAccounts.steam.steamId.substring(user.connectedAccounts.steam.steamId.length - 4)}`;
  }
  
  // Check if userId is a Steam ID
  if (user.userId && (user.userId.startsWith('765611') || user.userId.startsWith('7656119'))) {
    return `Steam Player ${user.userId.substring(user.userId.length - 4)}`;
  }
  
  // Final fallback: Use a generic gamer tag with part of the user ID
  return `Gamer ${(user.userId || '').substring(0, 6)}`;
};

// Fetch data on component mount
onMounted(() => {
  fetchPlayerProfile();
});
</script>

<style scoped>
.loading-spinner {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  position: relative;
}

.spinner-inner {
  position: absolute;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  width: 100%;
  height: 100%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.glow-orb {
  animation: pulse 8s ease-in-out infinite;
}

.glow-orb-delayed {
  animation: pulse 8s ease-in-out 4s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.2; }
}

.bg-grid-gaming {
  background-size: 50px 50px;
  background-image: 
    linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
}

.shadow-glow {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
}

.gaming-text {
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

.pulse-slow {
  animation: pulse-slow 6s ease-in-out infinite;
}

.pulse-slow-delayed {
  animation: pulse-slow 6s ease-in-out 3s infinite;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.1); }
}
</style> 