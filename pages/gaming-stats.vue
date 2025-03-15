<template>
  <div class="h-auto bg-gray-900 relative">
    <!-- Background elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Animated grid lines -->
      <div class="absolute inset-0 bg-grid-gaming opacity-10"></div>
      
      <!-- Glowing orbs -->
      <div class="glow-orb absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-500 opacity-10 blur-3xl"></div>
      <div class="glow-orb-delayed absolute bottom-1/3 left-1/3 w-96 h-96 rounded-full bg-purple-600 opacity-10 blur-3xl"></div>
    </div>

    <div class="container mx-auto py-6 px-4 sm:py-8 sm:px-6 lg:px-8 relative z-10">
      <!-- Loading state -->
      <div v-if="loading" class="flex flex-col justify-center items-center py-12">
        <div class="loading-spinner mb-6">
          <div class="spinner-inner"></div>
        </div>
        <p class="text-xl font-medium text-blue-300">Loading your gaming stats...</p>
        <p class="text-gray-400 mt-2">Analyzing your gaming achievements</p>
      </div>

      <!-- Not connected state -->
      <div v-else-if="!isSteamConnected" class="bg-gray-800 bg-opacity-70 shadow-glow rounded-xl p-8 text-center border border-gray-700 backdrop-blur-sm">
        <svg class="mx-auto h-20 w-20 text-gray-500 filter drop-shadow-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-6 text-xl font-medium text-blue-300 gaming-text">No gaming platforms connected</h3>
        <p class="mt-3 text-gray-300">Connect your Steam account to see your gaming stats.</p>
        <div class="mt-8">
          <NuxtLink to="/dashboard" class="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative overflow-hidden group">
            <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-20 group-hover:-translate-x-full"></span>
            Connect Gaming Accounts
          </NuxtLink>
        </div>
      </div>

      <!-- Stats content -->
      <div v-else>
        <!-- Platform selector - Mobile friendly -->
        <div class="mb-6 bg-gray-800 bg-opacity-70 shadow-glow rounded-xl p-4 border border-gray-700 backdrop-blur-sm">
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-gray-300 font-medium">Platform:</span>
            <div class="flex flex-wrap gap-2">
              <button 
                class="flex items-center px-3 py-2 rounded-md bg-blue-900/50 text-blue-300 font-medium border border-blue-700 hover:bg-blue-800/50 transition-colors"
              >
                <svg class="w-5 h-5 mr-2 text-blue-400 filter drop-shadow-glow" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.979 0C5.678 0 0.511 4.86 0.022 11.037l6.432 2.658c0.545-0.371 1.203-0.59 1.912-0.59 0.307 0 0.6 0.049 0.882 0.125l2.875-4.175V9.017c0-2.484 2.013-4.5 4.493-4.5 2.48 0 4.492 2.016 4.492 4.5s-2.013 4.5-4.492 4.5c-0.071 0-0.136-0.016-0.206-0.019l-4.1 2.934c0.008 0.061 0.019 0.123 0.019 0.185 0 1.933-1.557 3.5-3.479 3.5-1.688 0-3.088-1.205-3.416-2.803L0 16.068C1.549 20.704 6.295 24 11.979 24 18.626 24 24 18.617 24 11.999 24 5.382 18.626 0 11.979 0zM7.54 18.21l-1.473-0.61c0.262 0.543 0.714 0.999 1.314 1.25 1.297 0.539 2.793-0.076 3.332-1.375 0.263-0.63 0.264-1.319 0.005-1.949s-0.75-1.121-1.377-1.383c-0.624-0.26-1.29-0.249-1.878-0.03l1.523 0.63c0.956 0.4 1.409 1.5 1.009 2.455-0.397 0.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3-3.015-3-1.665 0-3.015 1.338-3.015 3s1.35 3 3.015 3c1.663 0 3.015-1.338 3.015-3zm-5.273-0.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/>
                </svg>
                Steam
              </button>
              <!-- Add more platform buttons here as needed -->
            </div>
          </div>
        </div>

        <!-- Stats overview - Responsive grid -->
        <div class="mb-6 max-h-auto grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <div class="bg-gray-800 bg-opacity-70 overflow-hidden shadow-glow rounded-xl border border-gray-700 backdrop-blur-sm transition hover:bg-gray-800/90">
            <div class="px-3 py-4 sm:px-4 sm:py-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-blue-900/70 rounded-md p-2 sm:p-3 border border-blue-700">
                  <svg class="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 filter drop-shadow-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div class="ml-3 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-xs sm:text-sm font-medium text-gray-400 truncate">Total Games</dt>
                    <dd class="flex items-baseline">
                      <div class="text-lg sm:text-2xl font-semibold text-blue-300">{{ games.length }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-800 bg-opacity-70 overflow-hidden shadow-glow rounded-xl border border-gray-700 backdrop-blur-sm transition hover:bg-gray-800/90">
            <div class="px-3 py-4 sm:px-4 sm:py-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-green-900/70 rounded-md p-2 sm:p-3 border border-green-700">
                  <svg class="h-5 w-5 sm:h-6 sm:w-6 text-green-400 filter drop-shadow-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-3 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-xs sm:text-sm font-medium text-gray-400 truncate">Total Playtime</dt>
                    <dd class="flex items-baseline">
                      <div class="text-lg sm:text-2xl font-semibold text-green-300">{{ formatTotalPlaytime }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-800 bg-opacity-70 overflow-hidden shadow-glow rounded-xl border border-gray-700 backdrop-blur-sm transition hover:bg-gray-800/90">
            <div class="px-3 py-4 sm:px-4 sm:py-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-purple-900/70 rounded-md p-2 sm:p-3 border border-purple-700">
                  <svg class="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 filter drop-shadow-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div class="ml-3 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-xs sm:text-sm font-medium text-gray-400 truncate">Most Played</dt>
                    <dd class="flex items-baseline">
                      <div class="text-lg sm:text-2xl font-semibold text-purple-300 truncate">{{ mostPlayedGame?.name || 'None' }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-800 bg-opacity-70 overflow-hidden shadow-glow rounded-xl border border-gray-700 backdrop-blur-sm transition hover:bg-gray-800/90">
            <div class="px-3 py-4 sm:px-4 sm:py-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-yellow-900/70 rounded-md p-2 sm:p-3 border border-yellow-700">
                  <svg class="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 filter drop-shadow-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div class="ml-3 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-xs sm:text-sm font-medium text-gray-400 truncate">Recently Played</dt>
                    <dd class="flex items-baseline">
                      <div class="text-lg sm:text-2xl font-semibold text-yellow-300">{{ recentlyPlayedCount }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Game list - Mobile responsive -->
        <div class="bg-gray-800 bg-opacity-70 shadow-glow rounded-xl overflow-hidden border border-gray-700 backdrop-blur-sm h-auto lg:h-[calc(100vh-25rem)]">
          <div class="px-4 py-4 border-b border-gray-700 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 class="text-xl leading-6 font-medium text-blue-300 gaming-text">Your Games</h3>
              <p class="mt-1 text-sm text-gray-400">A list of all your Steam games sorted by playtime.</p>
            </div>
            
            <!-- View toggle buttons for mobile -->
            <div class="mt-3 sm:mt-0 flex space-x-2">
              <button 
                @click="viewMode = 'list'"
                :class="[
                  'px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors',
                  viewMode === 'list' 
                    ? 'bg-blue-900/50 text-blue-300 border border-blue-700' 
                    : 'bg-gray-900/50 text-gray-300 border border-gray-700 hover:bg-gray-800/50'
                ]"
              >
                <span class="flex items-center">
                  <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  List
                </span>
              </button>
              <button 
                @click="viewMode = 'grid'"
                :class="[
                  'px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors',
                  viewMode === 'grid' 
                    ? 'bg-blue-900/50 text-blue-300 border border-blue-700' 
                    : 'bg-gray-900/50 text-gray-300 border border-gray-700 hover:bg-gray-800/50'
                ]"
              >
                <span class="flex items-center">
                  <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Grid
                </span>
              </button>
            </div>
          </div>
          
          <!-- Search and filter - Mobile friendly -->
          <div class="px-4 py-3 bg-gray-900/50 border-b border-gray-700">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="w-full sm:max-w-xs">
                <label for="search" class="sr-only">Search</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    v-model="searchQuery"
                    class="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md leading-5 text-gray-300 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search games"
                    type="search"
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
                  <option value="playtime">Most Played</option>
                  <option value="recent">Recently Played</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- List view -->
          <ul v-if="viewMode === 'list'" class="divide-y divide-gray-700 max-h-[600px] overflow-y-auto">
            <li v-for="game in sortedGames" :key="game.appid" @click="viewGameDetails(game)" class="cursor-pointer px-4 py-4 sm:px-6 hover:bg-gray-700/50 transition-colors">
              <div class="flex flex-col sm:flex-row sm:items-center">
                <div class="flex-shrink-0 h-24 w-full sm:h-16 sm:w-32 bg-gray-900 rounded overflow-hidden mb-3 sm:mb-0 border border-gray-700">
                  <img 
                    v-if="!game.imageError" 
                    :src="game.imageUrl || `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`" 
                    :alt="game.name" 
                    class="h-full w-full object-cover"
                    @error="handleImageError(game)"
                  />
                  <div v-else class="h-full w-full flex items-center justify-center bg-gray-800">
                    <span class="text-xs text-gray-400 text-center px-2">Image Unavailable</span>
                  </div>
                </div>
                <div class="min-w-0 flex-1 sm:px-4">
                  <div>
                    <p class="text-sm font-medium text-blue-300 truncate">{{ game.name }}</p>
                    <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <p class="flex items-center text-sm text-gray-400">
                        <svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="truncate">{{ formatPlaytime(game.playtime_forever) }}</span>
                      </p>
                      <p v-if="game.last_played" class="flex items-center text-sm text-gray-400">
                        <svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="truncate">{{ formatDate(game.last_played) }}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div class="mt-3 sm:mt-0">
                  <button 
                    @click="viewGameDetails(game)"
                    class="inline-flex items-center px-3 py-1 cursor-pointer border border-blue-700 text-sm leading-5 font-medium rounded-md text-blue-300 bg-blue-900/50 hover:bg-blue-800/50 transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            </li>
            <li v-if="sortedGames.length === 0" class="px-4 py-12 text-center text-gray-400">
              No games found matching your search.
            </li>
          </ul>
          
          <!-- Grid view -->
          <div v-else class="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto">
            <div v-for="game in sortedGames" :key="game.appid" @click="viewGameDetails(game)" class="bg-gray-800/70 border border-gray-700 rounded-lg overflow-hidden shadow-glow hover:bg-gray-700/50 transition cursor-pointer">
              <div class="h-24 sm:h-32 bg-gray-900 overflow-hidden">
                <img 
                  v-if="!game.imageError" 
                  :src="game.imageUrl || `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`" 
                  :alt="game.name" 
                  class="h-full w-full object-cover"
                  @error="handleImageError(game)"
                />
                <div v-else class="h-full w-full flex items-center justify-center bg-gray-800">
                  <span class="text-xs text-gray-400 text-center px-2">Image Unavailable</span>
                </div>
              </div>
              <div class="p-3">
                <h3 class="text-sm font-medium text-blue-300 truncate mb-1">{{ game.name }}</h3>
                <p class="text-xs text-gray-400 flex items-center">
                  <svg class="flex-shrink-0 mr-1 h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatPlaytime(game.playtime_forever) }}
                </p>
                <button 
                  @click="viewGameDetails(game)"
                  class="mt-2 w-full inline-flex justify-center cursor-pointer items-center px-2 py-1 border border-blue-700 text-xs font-medium rounded-md text-blue-300 bg-blue-900/50 hover:bg-blue-800/50 transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
            <div v-if="sortedGames.length === 0" class="col-span-full px-4 py-12 text-center text-gray-400">
              No games found matching your search.
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Game details modal -->
    <GameDetailsModal 
      :show="showGameModal" 
      :game="selectedGame" 
      @close="closeGameModal" 
    />
  </div>
</template>

<script setup lang="ts">
import { useFirebase } from '~/composables/useFirebase';

const { user } = useFirebase();
const loading = ref(true);
const games = ref<any[]>([]);
const searchQuery = ref('');
const selectedGame = ref<any>(null);
const showGameModal = ref(false);
const mobileMenuOpen = ref(false);
const viewMode = ref('list'); // 'list' or 'grid'
const sortOption = ref('playtime'); // 'playtime', 'recent', or 'name'

// Check if user has Steam connected
const isSteamConnected = computed(() => {
  return !!user.value?.providerData?.find(p => p.providerId === 'steam.com') || true; // For demo, always show content
});

// Filter and sort games based on search query and sort option
const sortedGames = computed(() => {
  let filtered = games.value;
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(game => game.name.toLowerCase().includes(query));
  }
  
  // Apply sorting
  return [...filtered].sort((a, b) => {
    if (sortOption.value === 'playtime') {
      return b.playtime_forever - a.playtime_forever;
    } else if (sortOption.value === 'recent') {
      return (b.last_played || 0) - (a.last_played || 0);
    } else if (sortOption.value === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });
});

// Get most played game
const mostPlayedGame = computed(() => {
  if (!games.value.length) return null;
  return [...games.value].sort((a, b) => b.playtime_forever - a.playtime_forever)[0];
});

// Get total playtime
const totalPlaytime = computed(() => {
  return games.value.reduce((total, game) => total + (game.playtime_forever || 0), 0);
});

// Format total playtime
const formatTotalPlaytime = computed(() => {
  const minutes = totalPlaytime.value;
  const hours = Math.floor(minutes / 60);
  
  if (hours < 1) {
    return `${minutes} minutes`;
  } else if (hours < 24) {
    return `${hours} hours`;
  } else {
    const days = Math.floor(hours / 24);
    return `${days} days`;
  }
});

// Count of recently played games (last 2 weeks)
const recentlyPlayedCount = computed(() => {
  return games.value.filter(game => game.playtime_2weeks).length;
});

// Format playtime
const formatPlaytime = (minutes: number): string => {
  if (!minutes) return 'Never played';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes} minutes`;
  } else if (hours === 1) {
    return `${hours} hour ${remainingMinutes > 0 ? `${remainingMinutes} minutes` : ''}`;
  } else {
    return `${hours} hours ${remainingMinutes > 0 ? `${remainingMinutes} minutes` : ''}`;
  }
};

// Format date
const formatDate = (timestamp: number): string => {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
};

// View game details
const viewGameDetails = (game: any): void => {
  // Create a deep copy of the game object to avoid reference issues
  selectedGame.value = JSON.parse(JSON.stringify(game));
  showGameModal.value = true;
};

// Close game modal
const closeGameModal = (): void => {
  showGameModal.value = false;
  // Wait a bit before clearing the selected game to avoid UI flicker
  setTimeout(() => {
    selectedGame.value = null;
  }, 300);
};

// Define the expected API response type
interface SteamGamesResponse {
  games?: any[];
  [key: string]: any;
}

// Fetch Steam games
const fetchGames = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await $fetch<SteamGamesResponse>('/api/steam/games');
    
    if (response.games && Array.isArray(response.games)) {
      games.value = response.games;
      
      // Sort games by playtime
      games.value.sort((a, b) => b.playtime_forever - a.playtime_forever);
      
      // Add error handling for game images
      games.value = games.value.map(game => ({
        ...game,
        imageUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
        imageError: false
      }));
    } else {
      console.warn('Invalid games data format:', response);
      setDemoGames();
    }
  } catch (error) {
    console.error('Error fetching games:', error);
    setDemoGames();
  } finally {
    loading.value = false;
  }
};

// Set demo games data for fallback
const setDemoGames = (): void => {
  games.value = [
    { appid: 570, name: 'Dota 2', playtime_forever: 1500, last_played: Date.now() / 1000, imageError: false },
    { appid: 730, name: 'Counter-Strike 2', playtime_forever: 2200, last_played: Date.now() / 1000, imageError: false },
    { appid: 440, name: 'Team Fortress 2', playtime_forever: 800, last_played: Date.now() / 1000, imageError: false },
    { appid: 271590, name: 'Grand Theft Auto V', playtime_forever: 1200, last_played: Date.now() / 1000, imageError: false },
    { appid: 1091500, name: 'Cyberpunk 2077', playtime_forever: 600, last_played: Date.now() / 1000, imageError: false },
    { appid: 1174180, name: 'Red Dead Redemption 2', playtime_forever: 900, last_played: Date.now() / 1000, imageError: false },
    { appid: 578080, name: 'PUBG: BATTLEGROUNDS', playtime_forever: 300, last_played: Date.now() / 1000, imageError: false },
    { appid: 252950, name: 'Rocket League', playtime_forever: 400, last_played: Date.now() / 1000, imageError: false },
    { appid: 1085660, name: 'Destiny 2', playtime_forever: 700, last_played: Date.now() / 1000, imageError: false },
    { appid: 1172470, name: 'Apex Legends', playtime_forever: 500, last_played: Date.now() / 1000, imageError: false },
  ];
};

// Handle image loading errors
const handleImageError = (game: any): void => {
  game.imageError = true;
};

onMounted(async () => {
  await fetchGames();
});
</script>

<style scoped>
.bg-grid-gaming {
  background-image: 
    linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
}

.shadow-glow {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.gaming-text {
  background: linear-gradient(90deg, #60a5fa, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.filter.drop-shadow-glow {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
}

.glow-orb {
  animation: pulse 8s infinite alternate;
}

.glow-orb-delayed {
  animation: pulse 8s infinite alternate-reverse;
}

@keyframes pulse {
  0% {
    opacity: 0.1;
    transform: scale(0.95);
  }
  100% {
    opacity: 0.3;
    transform: scale(1.05);
  }
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: conic-gradient(transparent 0%, rgba(59, 130, 246, 0.8));
  -webkit-mask: radial-gradient(circle at center, transparent 55%, white 55%);
  mask: radial-gradient(circle at center, transparent 55%, white 55%);
  animation: spin 1.5s linear infinite;
}

.spinner-inner {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #60a5fa;
  top: calc(50% - 5px);
  left: calc(50% - 5px);
  box-shadow: 0 0 15px 2px rgba(96, 165, 250, 0.6);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 