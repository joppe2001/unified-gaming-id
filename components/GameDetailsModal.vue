<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="close"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
        <div v-if="game" class="bg-white">
          <!-- Header with game image -->
          <div class="relative h-48 bg-gray-200">
            <img 
              :src="`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`" 
              :alt="game.name" 
              class="w-full h-full object-cover"
            />
            <button 
              @click="close" 
              class="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1 text-white hover:bg-opacity-100"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Game details -->
          <div class="px-6 py-4">
            <div class="flex justify-between items-start">
              <h3 class="text-2xl font-bold text-gray-900">{{ game.name }}</h3>
              <a 
                :href="`https://store.steampowered.com/app/${game.appid}`" 
                target="_blank" 
                class="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span>View on Steam</span>
                <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            
            <!-- Stats grid -->
            <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-sm font-medium text-gray-500">Total Playtime</div>
                <div class="mt-1 text-xl font-semibold text-gray-900">{{ formatPlaytime(game.playtime_forever) }}</div>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-sm font-medium text-gray-500">Last Played</div>
                <div class="mt-1 text-xl font-semibold text-gray-900">{{ formatDate(game.last_played) }}</div>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-sm font-medium text-gray-500">Recent Playtime (2 weeks)</div>
                <div class="mt-1 text-xl font-semibold text-gray-900">{{ formatPlaytime(game.playtime_2weeks || 0) }}</div>
              </div>
            </div>
            
            <!-- Achievements section -->
            <div class="mt-6">
              <h4 class="text-lg font-medium text-gray-900">Achievements</h4>
              <div v-if="loading" class="py-4 text-center text-gray-500">
                <svg class="animate-spin h-6 w-6 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="mt-2 block">Loading achievements...</span>
              </div>
              <div v-else-if="achievements.length === 0" class="py-4 text-center text-gray-500">
                No achievements available for this game.
              </div>
              <div v-else class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <div 
                  v-for="achievement in achievements" 
                  :key="achievement.name" 
                  class="flex items-center p-2 rounded-md"
                  :class="achievement.unlocked ? 'bg-green-50' : 'bg-gray-50'"
                >
                  <div class="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-200">
                    <img :src="achievement.iconUrl" :alt="achievement.name" class="h-full w-full object-cover" />
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium" :class="achievement.unlocked ? 'text-green-800' : 'text-gray-700'">
                      {{ achievement.name }}
                    </p>
                    <p class="text-xs text-gray-500">{{ achievement.description }}</p>
                  </div>
                  <div class="ml-auto">
                    <span 
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      :class="achievement.unlocked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                    >
                      {{ achievement.unlocked ? 'Unlocked' : 'Locked' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="px-6 py-3 bg-gray-50 text-right">
            <button 
              @click="close" 
              class="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  game: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);

const loading = ref(false);
const achievements = ref([]);

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

// Close the modal
const close = () => {
  emit('close');
};

// Fetch achievements when game changes
watch(() => props.game, async (newGame) => {
  if (newGame && props.show) {
    await fetchAchievements(newGame.appid);
  }
}, { immediate: true });

// Fetch achievements for a game
const fetchAchievements = async (gameId) => {
  if (!gameId) return;
  
  loading.value = true;
  try {
    const response = await $fetch(`/api/steam/achievements?gameId=${gameId}`);
    achievements.value = response.achievements || [];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    // Sample data for demo
    achievements.value = [
      {
        name: 'First Victory',
        description: 'Win your first match',
        iconUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/570/d4f85b1d9797f45d4d13f92a6a2104bd7b2a8b8e.jpg',
        unlocked: true
      },
      {
        name: 'Master Strategist',
        description: 'Win 100 matches',
        iconUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/570/9c2968822b92b44c11cca5741ae2ce90323111f5.jpg',
        unlocked: false
      },
      {
        name: 'Collector',
        description: 'Collect 50 unique items',
        iconUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/570/a89b8bb6764375d0a0534ff4e5faf4298c0731d3.jpg',
        unlocked: true
      }
    ];
  } finally {
    loading.value = false;
  }
};
</script> 