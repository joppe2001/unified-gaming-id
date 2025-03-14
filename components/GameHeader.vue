<template>
  <div>
    <!-- Header with game image -->
    <div class="relative h-48 bg-gray-900 border-b border-gray-700 overflow-hidden">
      <img 
        :src="`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`" 
        :alt="game.name" 
        class="w-full h-full object-cover"
        @error="handleImageError"
        ref="gameHeaderImage"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
      <button 
        @click="close" 
        class="absolute hidden lg:block top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1 text-blue-300 hover:bg-gray-700 border border-gray-700"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- Game details -->
    <div class="px-6 py-4">
      <div class="flex justify-between items-start">
        <h3 class="text-2xl font-bold text-blue-300 gaming-text">{{ game.name }}</h3>
        <a 
          :href="`https://store.steampowered.com/app/${game.appid}`" 
          target="_blank" 
          class="text-blue-400 hover:text-blue-300 flex items-center transition-colors"
        >
          <span>View on Steam</span>
          <svg class="ml-1 h-4 w-4 filter drop-shadow-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      
      <!-- Stats grid -->
      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="bg-gray-900/50 rounded-lg p-4 border border-gray-700 shadow-glow">
          <div class="text-sm font-medium text-gray-400">Total Playtime</div>
          <div class="mt-1 text-xl font-semibold text-green-300">{{ formatPlaytime(game.playtime_forever) }}</div>
        </div>
        
        <div class="bg-gray-900/50 rounded-lg p-4 border border-gray-700 shadow-glow">
          <div class="text-sm font-medium text-gray-400">Last Played</div>
          <div class="mt-1 text-xl font-semibold text-yellow-300">{{ formatDate(game.last_played) }}</div>
        </div>
        
        <div class="bg-gray-900/50 rounded-lg p-4 border border-gray-700 shadow-glow">
          <div class="text-sm font-medium text-gray-400">Recent Playtime (2 weeks)</div>
          <div class="mt-1 text-xl font-semibold text-purple-300">{{ formatPlaytime(game.playtime_2weeks || 0) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Define the Game interface
interface Game {
  appid: string | number;
  name: string;
  playtime_forever?: number;
  playtime_2weeks?: number;
  last_played?: number;
}

const props = defineProps({
  game: {
    type: Object as () => Game,
    required: true
  }
});

const emit = defineEmits(['close']);

// Handle image loading errors
const gameHeaderImage = ref<HTMLImageElement | null>(null);
const handleImageError = () => {
  if (gameHeaderImage.value) {
    gameHeaderImage.value.src = '/images/game-placeholder.jpg';
  }
};

// Format playtime
const formatPlaytime = (minutes: number | undefined) => {
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
const formatDate = (timestamp: number | undefined) => {
  if (!timestamp) return 'Unknown';
  
  try {
    const date = new Date(timestamp * 1000);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Unknown';
    }
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown';
  }
};

// Close the modal
const close = () => {
  emit('close');
};
</script> 