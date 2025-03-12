<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Your Games</h2>
      
      <div v-if="platforms.length > 0" class="flex space-x-2">
        <button 
          v-for="platform in platforms" 
          :key="platform.id"
          @click="selectPlatform(platform.id)"
          class="p-2 rounded-md"
          :class="activePlatform?.id === platform.id ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'"
        >
          <img :src="platform.icon" :alt="`${platform.name} logo`" class="w-5 h-5" />
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
      <p>Loading games...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
      {{ error }}
    </div>
    
    <div v-else-if="games.length === 0" class="text-center py-10">
      <p v-if="activePlatform" class="text-gray-500">
        No games found for {{ activePlatform.name }}. Make sure your profile is public.
      </p>
      <p v-else class="text-gray-500">
        Select a platform to view your games.
      </p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="game in games" 
        :key="`${game.platformId}-${game.gameId}`"
        class="bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
      >
        <img 
          v-if="game.imageUrl" 
          :src="game.imageUrl" 
          :alt="game.name" 
          class="w-full h-32 object-cover"
        />
        <div class="p-4">
          <h3 class="font-semibold truncate">{{ game.name }}</h3>
          <div class="flex justify-between text-sm text-gray-600 mt-2">
            <span>{{ formatPlaytime(game.playtime) }}</span>
            <span v-if="game.lastPlayed">Last: {{ formatDate(game.lastPlayed) }}</span>
          </div>
          <button 
            @click="viewGameDetails(game)"
            class="mt-3 w-full py-1 px-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GamePlatform, PlatformGame, usePlatforms } from '~/composables/usePlatform';

const { platforms, activePlatform, setActivePlatform } = usePlatforms();
const games = ref<PlatformGame[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Format playtime (minutes to hours and minutes)
const formatPlaytime = (minutes?: number): string => {
  if (!minutes) return 'Never played';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} minutes`;
  } else if (mins === 0) {
    return `${hours} hours`;
  } else {
    return `${hours} hours, ${mins} minutes`;
  }
};

// Format date to relative time
const formatDate = (date?: Date): string => {
  if (!date) return 'Never';
  
  // Simple relative time: today, yesterday, or actual date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
};

// Select a platform and load its games
const selectPlatform = async (platformId: string) => {
  setActivePlatform(platformId);
  await loadGames();
};

// Load games for the active platform
const loadGames = async () => {
  if (!activePlatform.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    games.value = await activePlatform.value.getGames();
    
    // Sort by last played
    games.value.sort((a, b) => {
      if (!a.lastPlayed) return 1;
      if (!b.lastPlayed) return -1;
      return b.lastPlayed.getTime() - a.lastPlayed.getTime();
    });
  } catch (err: any) {
    console.error('Error loading games:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// View game details (navigate to game detail page)
const viewGameDetails = (game: PlatformGame) => {
  navigateTo(`/games/${game.platformId}/${game.gameId}`);
};

// Watch for changes in active platform
watch(activePlatform, async (newPlatform) => {
  if (newPlatform) {
    games.value = [];
    await loadGames();
  }
});

// Load first platform's games on mount
onMounted(async () => {
  if (platforms.value.length > 0 && !activePlatform.value) {
    setActivePlatform(platforms.value[0].id);
  }
});
</script> 