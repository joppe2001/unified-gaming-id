<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
      <p class="text-xl">Loading game details...</p>
    </div>
    
    <div v-else-if="error" class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 my-10">
      <div class="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3 class="text-lg font-semibold mb-2">Error</h3>
        <p>{{ error }}</p>
      </div>
      <NuxtLink to="/dashboard" class="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        Back to Dashboard
      </NuxtLink>
    </div>
    
    <div v-else-if="!platform || !game" class="text-center py-10">
      <p class="text-xl mb-4">Game not found or platform not connected</p>
      <NuxtLink to="/dashboard" class="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        Back to Dashboard
      </NuxtLink>
    </div>
    
    <div v-else class="max-w-4xl mx-auto">
      <div class="flex mb-6">
        <NuxtLink to="/dashboard" class="py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300 transition flex items-center">
          <span class="mr-2">←</span> Back
        </NuxtLink>
      </div>
      
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="relative">
          <img 
            v-if="game.imageUrl" 
            :src="game.imageUrl" 
            :alt="game.name" 
            class="w-full h-64 object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
          <div class="absolute bottom-0 left-0 p-6">
            <div class="flex items-center mb-2">
              <img :src="platform.icon" :alt="platform.name" class="w-6 h-6 mr-2" />
              <span class="text-white font-medium">{{ platform.name }}</span>
            </div>
            <h1 class="text-3xl font-bold text-white">{{ game.name }}</h1>
          </div>
        </div>
        
        <div class="p-6">
          <div class="flex flex-wrap gap-4 mb-6 text-sm">
            <div class="bg-gray-100 p-3 rounded-lg">
              <div class="font-semibold text-gray-700">Total Playtime</div>
              <div class="text-xl mt-1">{{ formatPlaytime(game.playtime) }}</div>
            </div>
            
            <div v-if="game.lastPlayed" class="bg-gray-100 p-3 rounded-lg">
              <div class="font-semibold text-gray-700">Last Played</div>
              <div class="text-xl mt-1">{{ formatDate(game.lastPlayed) }}</div>
            </div>
            
            <div v-if="achievements.length > 0" class="bg-gray-100 p-3 rounded-lg">
              <div class="font-semibold text-gray-700">Achievements</div>
              <div class="text-xl mt-1">
                {{ achievements.filter(a => a.unlocked).length }} / {{ achievements.length }}
                <span class="text-sm text-gray-500">
                  ({{ Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100) }}%)
                </span>
              </div>
            </div>
          </div>
          
          <h2 class="text-2xl font-bold mb-4">Achievements</h2>
          
          <div v-if="loadingAchievements" class="text-center py-6">
            <div class="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-2"></div>
            <p>Loading achievements...</p>
          </div>
          
          <div v-else-if="achievements.length === 0" class="text-center py-6 text-gray-500">
            No achievements available for this game.
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="achievement in achievements" 
              :key="achievement.achievementId"
              class="flex items-start p-3 rounded-lg"
              :class="achievement.unlocked ? 'bg-green-50' : 'bg-gray-50'"
            >
              <img 
                :src="achievement.iconUrl || '/icons/achievement-placeholder.svg'" 
                :alt="achievement.name"
                class="w-12 h-12 object-contain mr-3"
                :class="{'opacity-40': !achievement.unlocked}"
              />
              
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <h3 class="font-semibold" :class="{'text-gray-500': !achievement.unlocked}">
                    {{ achievement.name }}
                  </h3>
                  <div class="text-xs bg-gray-200 px-2 py-1 rounded-full">
                    {{ Math.round(achievement.rarity || 0) }}% of players
                  </div>
                </div>
                
                <p class="text-sm text-gray-600 mt-1">{{ achievement.description }}</p>
                
                <div v-if="achievement.unlocked && achievement.unlockTime" class="text-xs text-green-600 mt-2">
                  Unlocked on {{ formatFullDate(achievement.unlockTime) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GamePlatform, PlatformGame, PlatformAchievement, usePlatforms } from '~/composables/usePlatform';
import { useSteamPlatform } from '~/composables/useSteamPlatform';

const { steamPlatform } = useSteamPlatform();
const { platforms } = usePlatforms();
const game = ref<PlatformGame | null>(null);
const achievements = ref<PlatformAchievement[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const loadingAchievements = ref(false);

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

// Format full date
const formatFullDate = (date?: Date): string => {
  if (!date) return 'Unknown';
  return date.toLocaleDateString();
};

// Load game details
const loadGameDetails = async () => {
  if (!steamPlatform.value || !game.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    game.value = await steamPlatform.value.getGames()[0];
    achievements.value = await steamPlatform.value.getAchievements(game.value.gameId);
  } catch (err: any) {
    console.error('Error loading game details:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Load achievements
const loadAchievements = async () => {
  if (!steamPlatform.value || !game.value) return;
  
  loadingAchievements.value = true;
  error.value = null;
  
  try {
    achievements.value = await steamPlatform.value.getAchievements(game.value.gameId);
  } catch (err: any) {
    console.error('Error loading achievements:', err);
    error.value = err.message;
  } finally {
    loadingAchievements.value = false;
  }
};

// Watch for changes in game
watch(game, async (newGame) => {
  if (newGame) {
    await loadAchievements();
  }
});

// Load game details on mount
onMounted(async () => {
  if (platforms.value.length > 0 && !game.value) {
    game.value = platforms.value[0].getGames()[0];
  }
});
</script> 