<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header with navigation -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-2xl font-bold text-gray-900">Gaming Stats</h1>
            </div>
            <nav class="ml-6 flex space-x-4">
              <NuxtLink to="/dashboard" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700">Dashboard</NuxtLink>
              <NuxtLink to="/gaming-stats" class="px-3 py-2 rounded-md text-sm font-medium text-blue-600 border-b-2 border-blue-500">Stats</NuxtLink>
            </nav>
          </div>
          <div class="flex items-center">
            <NuxtLink to="/profile" class="text-gray-500 hover:text-gray-700">
              <span class="sr-only">Profile</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <svg class="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="ml-3 text-lg text-gray-600">Loading your gaming stats...</span>
      </div>

      <!-- Not connected state -->
      <div v-else-if="!isSteamConnected" class="bg-white shadow rounded-lg p-6 text-center">
        <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No gaming platforms connected</h3>
        <p class="mt-2 text-sm text-gray-500">Connect your Steam account to see your gaming stats.</p>
        <div class="mt-6">
          <NuxtLink to="/dashboard" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Connect Gaming Accounts
          </NuxtLink>
        </div>
      </div>

      <!-- Stats content -->
      <div v-else>
        <!-- Platform selector -->
        <div class="mb-6 bg-white shadow rounded-lg p-4">
          <div class="flex items-center space-x-4">
            <span class="text-gray-700 font-medium">Platform:</span>
            <button 
              class="flex items-center px-3 py-2 rounded-md bg-blue-100 text-blue-800 font-medium"
            >
              <img src="/images/steam-logo.svg" alt="Steam" class="w-5 h-5 mr-2" />
              Steam
            </button>
          </div>
        </div>

        <!-- Stats overview -->
        <div class="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Games</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ games.length }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Playtime</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ formatTotalPlaytime }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Most Played Game</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ mostPlayedGame?.name || 'None' }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Recently Played</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ recentlyPlayedCount }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Game list -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Your Games</h3>
            <p class="mt-1 text-sm text-gray-500">A list of all your Steam games sorted by playtime.</p>
          </div>
          
          <!-- Search and filter -->
          <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div class="flex items-center">
              <div class="max-w-lg w-full lg:max-w-xs">
                <label for="search" class="sr-only">Search</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    v-model="searchQuery"
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search games"
                    type="search"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Game list -->
          <ul class="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            <li v-for="game in filteredGames" :key="game.appid" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div class="flex items-center">
                <div class="min-w-0 flex-1 flex items-center">
                  <div class="flex-shrink-0 h-16 w-32 bg-gray-200 rounded overflow-hidden">
                    <img :src="`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`" :alt="game.name" class="h-full w-full object-cover" />
                  </div>
                  <div class="min-w-0 flex-1 px-4">
                    <div>
                      <p class="text-sm font-medium text-blue-600 truncate">{{ game.name }}</p>
                      <p class="mt-1 flex items-center text-sm text-gray-500">
                        <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="truncate">{{ formatPlaytime(game.playtime_forever) }}</span>
                      </p>
                      <p v-if="game.last_played" class="mt-1 flex items-center text-sm text-gray-500">
                        <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="truncate">Last played: {{ formatDate(game.last_played) }}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <button 
                    @click="viewGameDetails(game)"
                    class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Details
                  </button>
                </div>
              </div>
            </li>
            <li v-if="filteredGames.length === 0" class="px-4 py-12 text-center text-gray-500">
              No games found matching your search.
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFirebase } from '~/composables/useFirebase';

const { user } = useFirebase();
const loading = ref(true);
const games = ref([]);
const searchQuery = ref('');
const selectedGame = ref(null);

// Check if user has Steam connected
const isSteamConnected = computed(() => {
  return !!user.value?.providerData?.find(p => p.providerId === 'steam.com') || true; // For demo, always show content
});

// Filter games based on search query
const filteredGames = computed(() => {
  if (!searchQuery.value) return games.value;
  const query = searchQuery.value.toLowerCase();
  return games.value.filter(game => game.name.toLowerCase().includes(query));
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
const formatPlaytime = (minutes) => {
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
const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
};

// View game details
const viewGameDetails = (game) => {
  selectedGame.value = game;
  // In a real app, you might navigate to a game details page or open a modal
  console.log('View details for:', game.name);
};

// Fetch Steam games
const fetchGames = async () => {
  loading.value = true;
  try {
    const response = await $fetch('/api/steam/games');
    games.value = response.games || [];
    
    // Sort games by playtime
    games.value.sort((a, b) => b.playtime_forever - a.playtime_forever);
  } catch (error) {
    console.error('Error fetching games:', error);
    // For demo purposes, add some sample data if the API fails
    games.value = [
      { appid: 570, name: 'Dota 2', playtime_forever: 1500, last_played: Date.now() / 1000 },
      { appid: 730, name: 'Counter-Strike 2', playtime_forever: 2200, last_played: Date.now() / 1000 },
      { appid: 440, name: 'Team Fortress 2', playtime_forever: 800, last_played: Date.now() / 1000 },
      { appid: 271590, name: 'Grand Theft Auto V', playtime_forever: 1200, last_played: Date.now() / 1000 },
      { appid: 1091500, name: 'Cyberpunk 2077', playtime_forever: 600, last_played: Date.now() / 1000 },
      { appid: 1174180, name: 'Red Dead Redemption 2', playtime_forever: 900, last_played: Date.now() / 1000 },
      { appid: 578080, name: 'PUBG: BATTLEGROUNDS', playtime_forever: 300, last_played: Date.now() / 1000 },
      { appid: 252950, name: 'Rocket League', playtime_forever: 400, last_played: Date.now() / 1000 },
      { appid: 1085660, name: 'Destiny 2', playtime_forever: 700, last_played: Date.now() / 1000 },
      { appid: 1172470, name: 'Apex Legends', playtime_forever: 500, last_played: Date.now() / 1000 },
    ];
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchGames();
});
</script> 