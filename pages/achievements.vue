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
          <h1 class="text-3xl font-bold gaming-text text-blue-300 mb-2">Achievement Leaderboard</h1>
          <p class="text-gray-400">See who's leading the pack in gaming achievements</p>
        </div>
        <NuxtLink to="/dashboard" class="mt-4 md:mt-0 py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition border border-gray-700 relative overflow-hidden group">
          <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 group-hover:-translate-x-full"></span>
          Back to Dashboard
        </NuxtLink>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-10">
        <div class="loading-spinner mb-4">
          <div class="spinner-inner"></div>
        </div>
        <p class="text-xl text-blue-400">Loading leaderboard...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center">
        <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-red-300">Failed to load leaderboard</h3>
        <p class="mt-2 text-sm text-gray-300">{{ errorMessage }}</p>
        <button @click="fetchLeaderboard" class="mt-4 py-2 px-4 bg-red-800 hover:bg-red-700 text-white rounded-md transition">
          Try Again
        </button>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="bg-gray-800 bg-opacity-70 overflow-hidden shadow-glow rounded-xl border border-gray-700 backdrop-blur-sm">
            <div class="px-4 py-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-blue-900/70 rounded-md p-3 border border-blue-700">
                  <svg class="h-6 w-6 text-blue-400 filter drop-shadow-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-400 truncate">Active Gamers</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-blue-300">{{ users.length }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-800 bg-opacity-70 overflow-hidden shadow-glow rounded-xl border border-gray-700 backdrop-blur-sm">
            <div class="px-4 py-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-green-900/70 rounded-md p-3 border border-green-700">
                  <svg class="h-6 w-6 text-green-400 filter drop-shadow-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-400 truncate">Total Achievements</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-green-300">{{ totalAchievements }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-800 bg-opacity-70 overflow-hidden shadow-glow rounded-xl border border-gray-700 backdrop-blur-sm">
            <div class="px-4 py-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-yellow-900/70 rounded-md p-3 border border-yellow-700">
                  <svg class="h-6 w-6 text-yellow-400 filter drop-shadow-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-400 truncate">Top Completion Rate</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-yellow-300">{{ topCompletionRate }}%</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-gray-800 bg-opacity-70 rounded-xl shadow-glow border border-gray-700 overflow-hidden backdrop-blur-sm mb-6">
          <div class="p-4">
            <div class="flex flex-col md:flex-row gap-4">
              <!-- Search -->
              <div class="flex-1">
                <div class="relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md leading-5 text-gray-300 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search players"
                  />
                </div>
              </div>
              
              <!-- Sort options -->
              <div class="flex items-center">
                <label for="sort" class="text-sm font-medium text-gray-300 mr-2">Sort:</label>
                <select 
                  id="sort" 
                  v-model="sortOption"
                  class="block w-full pl-3 pr-10 py-2 text-base bg-gray-800 border-gray-700 text-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="achievements">Most Achievements</option>
                  <option value="completion">Highest Completion %</option>
                  <option value="recent">Recently Active</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Leaderboard -->
        <div class="bg-gray-800 bg-opacity-70 rounded-xl shadow-glow border border-gray-700 overflow-hidden backdrop-blur-sm">
          <div class="overflow-hidden">
            <div class="max-h-[600px] overflow-y-auto">
              <!-- Leaderboard Header -->
              <div class="bg-gray-900/50 border-b border-gray-700 px-4 py-3 hidden md:grid md:grid-cols-12 text-sm font-medium text-gray-400">
                <div class="md:col-span-1 text-center">#</div>
                <div class="md:col-span-4">Player</div>
                <div class="md:col-span-2 text-center">Achievements</div>
                <div class="md:col-span-2 text-center">Completion</div>
                <div class="md:col-span-2 text-center">Games</div>
                <div class="md:col-span-1 text-center"></div>
              </div>
              
              <!-- Leaderboard Rows -->
              <ul v-if="filteredUsers.length > 0" class="divide-y divide-gray-700">
                <li v-for="(user, index) in filteredUsers" :key="user.userId" 
                    :class="[
                      'hover:bg-gray-700/50 transition-colors',
                      index === 0 ? 'bg-yellow-900/20 border-l-4 border-yellow-500' : '',
                      index === 1 ? 'bg-gray-400/10 border-l-4 border-gray-400' : '',
                      index === 2 ? 'bg-amber-800/20 border-l-4 border-amber-700' : ''
                    ]">
                  <!-- Mobile View -->
                  <div class="md:hidden p-4">
                    <div class="flex items-center mb-2">
                      <div class="flex-shrink-0 mr-3">
                        <div class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
                             :class="[
                               index === 0 ? 'bg-yellow-500/70 text-yellow-100 border border-yellow-400' : '',
                               index === 1 ? 'bg-gray-400/70 text-gray-100 border border-gray-300' : '',
                               index === 2 ? 'bg-amber-700/70 text-amber-100 border border-amber-600' : 'bg-gray-900/70 border border-gray-700 text-gray-300'
                             ]">
                          {{ index + 1 }}
                        </div>
                      </div>
                      <div class="flex items-center">
                        <div class="h-10 w-10 rounded-full overflow-hidden border border-gray-700 mr-3">
                          <img 
                            :src="user.photoURL || `https://api.dicebear.com/6.x/bottts/svg?seed=${user.displayName || user.userId}`" 
                            :alt="user.displayName || 'User'" 
                            class="h-full w-full object-cover"
                            @error="handleImageError"
                          />
                        </div>
                        <div>
                          <p class="font-medium" 
                             :class="[
                               index === 0 ? 'text-yellow-300' : '',
                               index === 1 ? 'text-gray-300' : '',
                               index === 2 ? 'text-amber-300' : 'text-blue-300'
                             ]">
                            {{ getUserDisplayName(user) }}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-sm mt-3">
                      <div class="bg-gray-900/30 rounded p-2 text-center">
                        <p class="text-gray-400 text-xs">Achievements</p>
                        <p class="text-white font-medium">{{ user.unlockedAchievements }}</p>
                      </div>
                      <div class="bg-gray-900/30 rounded p-2 text-center">
                        <p class="text-gray-400 text-xs">Completion</p>
                        <p class="text-white font-medium">{{ formatPercentage(user.achievementRate) }}%</p>
                      </div>
                      <div class="bg-gray-900/30 rounded p-2 text-center">
                        <p class="text-gray-400 text-xs">Games</p>
                        <p class="text-white font-medium">{{ user.games.length }}</p>
                      </div>
                      <div class="bg-gray-900/30 rounded p-2 text-center">
                        <NuxtLink :to="`/player/${user.userId}`" class="text-blue-400 text-xs hover:text-blue-300">
                          View Profile
                        </NuxtLink>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Desktop View -->
                  <div class="hidden md:grid md:grid-cols-12 md:items-center px-4 py-4">
                    <div class="md:col-span-1 text-center">
                      <div class="inline-flex w-8 h-8 items-center justify-center rounded-full text-sm font-bold"
                           :class="[
                             index === 0 ? 'bg-yellow-500/70 text-yellow-100 border border-yellow-400 shadow-glow-gold' : '',
                             index === 1 ? 'bg-gray-400/70 text-gray-100 border border-gray-300 shadow-glow-silver' : '',
                             index === 2 ? 'bg-amber-700/70 text-amber-100 border border-amber-600 shadow-glow-bronze' : 'bg-gray-900/70 border border-gray-700 text-gray-300'
                           ]">
                        {{ index + 1 }}
                      </div>
                    </div>
                    <div class="md:col-span-4">
                      <div class="flex items-center">
                        <div class="h-10 w-10 rounded-full overflow-hidden border border-gray-700 mr-3"
                             :class="[
                               index === 0 ? 'border-yellow-500' : '',
                               index === 1 ? 'border-gray-400' : '',
                               index === 2 ? 'border-amber-700' : ''
                             ]">
                          <img 
                            :src="user.photoURL || `https://api.dicebear.com/6.x/bottts/svg?seed=${user.displayName || user.userId}`" 
                            :alt="user.displayName || 'User'" 
                            class="h-full w-full object-cover"
                            @error="handleImageError"
                          />
                        </div>
                        <div>
                          <p class="font-medium" 
                             :class="[
                               index === 0 ? 'text-yellow-300' : '',
                               index === 1 ? 'text-gray-300' : '',
                               index === 2 ? 'text-amber-300' : 'text-blue-300'
                             ]">
                            {{ getUserDisplayName(user) }}
                          </p>
                          <p class="text-xs text-gray-400">Last active {{ formatDate(user.lastUnlocked) }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="md:col-span-2 text-center">
                      <p class="text-white font-medium">{{ user.unlockedAchievements }}</p>
                      <p class="text-xs text-gray-400">of {{ user.totalAchievements }}</p>
                    </div>
                    <div class="md:col-span-2 text-center">
                      <div class="w-full bg-gray-700 rounded-full h-2.5 mb-1">
                        <div class="h-2.5 rounded-full" :style="`width: ${user.achievementRate}%`" :class="getCompletionColorClass(user.achievementRate)"></div>
                      </div>
                      <p class="text-xs" :class="getCompletionTextClass(user.achievementRate)">{{ formatPercentage(user.achievementRate) }}%</p>
                    </div>
                    <div class="md:col-span-2 text-center">
                      <p class="text-white font-medium">{{ user.games.length }}</p>
                      <p class="text-xs text-gray-400">
                        <span v-if="user.games.length > 0">{{ user.games[0].gameName }}</span>
                        <span v-if="user.games.length > 1">+{{ user.games.length - 1 }} more</span>
                      </p>
                    </div>
                    <div class="md:col-span-1 text-center">
                      <NuxtLink :to="`/player/${user.userId}`" 
                                class="inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded text-blue-300 bg-blue-900/50 hover:bg-blue-800/50 transition-colors"
                                :class="[
                                  index === 0 ? 'border-yellow-500 text-yellow-300 bg-yellow-900/50 hover:bg-yellow-800/50' : '',
                                  index === 1 ? 'border-gray-400 text-gray-300 bg-gray-700/50 hover:bg-gray-600/50' : '',
                                  index === 2 ? 'border-amber-700 text-amber-300 bg-amber-900/50 hover:bg-amber-800/50' : 'border-blue-700'
                                ]">
                        View
                      </NuxtLink>
                    </div>
                  </div>
                </li>
              </ul>
              
              <div v-else class="px-4 py-12 text-center text-gray-400">
                No players found matching your search.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// State
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const users = ref([]);
const totalAchievements = ref(0);
const searchQuery = ref('');
const sortOption = ref('achievements');

// Computed stats
const topCompletionRate = computed(() => {
  if (users.value.length === 0) return 0;
  const topRate = Math.max(...users.value.map(user => user.achievementRate));
  return formatPercentage(topRate);
});

// Filtered and sorted users
const filteredUsers = computed(() => {
  let filtered = users.value;
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user => 
      (user.displayName && user.displayName.toLowerCase().includes(query)) ||
      user.games.some(game => game.gameName.toLowerCase().includes(query))
    );
  }
  
  // Apply sorting
  switch (sortOption.value) {
    case 'achievements':
      return [...filtered].sort((a, b) => b.unlockedAchievements - a.unlockedAchievements);
    case 'completion':
      return [...filtered].sort((a, b) => b.achievementRate - a.achievementRate);
    case 'recent':
      return [...filtered].sort((a, b) => b.lastUnlocked - a.lastUnlocked);
    case 'name':
      return [...filtered].sort((a, b) => {
        const nameA = a.displayName || '';
        const nameB = b.displayName || '';
        return nameA.localeCompare(nameB);
      });
    default:
      return filtered;
  }
});

// Fetch leaderboard data
const fetchLeaderboard = async () => {
  loading.value = true;
  error.value = false;
  
  try {
    // Call the API endpoint to get user achievement data
    const response = await fetch('/api/achievements/community');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
    }
    
    const data = await response.json();
    users.value = data.users || [];
    totalAchievements.value = data.totalAchievements || 0;
    
    loading.value = false;
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    error.value = true;
    errorMessage.value = err.message || 'Failed to load leaderboard data';
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
  fetchLeaderboard();
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

.shadow-glow-gold {
  box-shadow: 0 0 15px rgba(234, 179, 8, 0.5);
}

.shadow-glow-silver {
  box-shadow: 0 0 15px rgba(156, 163, 175, 0.5);
}

.shadow-glow-bronze {
  box-shadow: 0 0 15px rgba(180, 83, 9, 0.5);
}
</style> 