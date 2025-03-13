<template>
  <div class="achievement-stats">
    <!-- Loading state -->
    <div v-if="loading" class="py-4 text-center text-gray-500">
      <svg class="animate-spin h-6 w-6 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="mt-2 block">Loading achievements...</span>
    </div>
    
    <!-- No achievements state -->
    <div v-else-if="achievements.length === 0" class="py-4 text-center text-gray-500">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="mt-2">No achievements available for this game.</p>
      <p class="text-sm text-gray-400">The game may not have achievements or they may be private.</p>
    </div>
    
    <!-- Achievement stats -->
    <div v-else>
      <!-- Achievement progress -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-700">Achievement Progress</span>
          <span class="text-sm font-medium text-gray-700">{{ unlockedCount }} / {{ achievements.length }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            class="bg-green-600 h-2.5 rounded-full" 
            :style="{ width: `${completionPercentage}%` }"
          ></div>
        </div>
        <div class="mt-1 text-xs text-gray-500 text-right">{{ completionPercentage }}% Complete</div>
      </div>
      
      <!-- Achievement list -->
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="achievement in achievements" 
          :key="achievement.achievementId" 
          class="flex items-center p-2 rounded-md"
          :class="achievement.unlocked ? 'bg-green-50' : 'bg-gray-50'"
        >
          <div class="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-200">
            <img 
              :src="achievement.unlocked ? achievement.iconUrl : (achievement.iconGrayUrl || achievement.iconUrl)" 
              :alt="achievement.name" 
              class="h-full w-full object-cover"
              @error="handleImageError($event)"
            />
          </div>
          <div class="ml-3 flex-1 min-w-0">
            <p class="text-sm font-medium truncate" :class="achievement.unlocked ? 'text-green-800' : 'text-gray-700'">
              {{ achievement.name }}
            </p>
            <p class="text-xs text-gray-500 truncate">{{ achievement.description }}</p>
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
</template>

<script setup lang="ts">

const props = defineProps({
  gameId: {
    type: [Number, String],
    required: true
  }
});

const loading = ref(false);
const achievements = ref<any[]>([]);
const error = ref<string | null>(null);

// Computed properties for achievement stats
const unlockedCount = computed(() => {
  return achievements.value.filter(a => a.unlocked).length;
});

const completionPercentage = computed(() => {
  if (achievements.value.length === 0) return 0;
  return Math.round((unlockedCount.value / achievements.value.length) * 100);
});

// Handle image loading errors
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/images/achievement-placeholder.png';
};

// Fetch achievements when gameId changes
watch(() => props.gameId, async (newGameId) => {
  if (newGameId) {
    await fetchAchievements(newGameId);
  }
}, { immediate: true });

// Fetch achievements for a game
const fetchAchievements = async (gameId: number | string) => {
  if (!gameId) return;
  
  loading.value = true;
  achievements.value = []; // Reset achievements
  error.value = null;
  
  try {
    const response = await $fetch(`/api/steam/achievements?gameId=${gameId}`);
    
    if (response.achievements && Array.isArray(response.achievements)) {
      achievements.value = response.achievements;
    } else {
      console.warn('Invalid achievements data format:', response);
      achievements.value = [];
    }
  } catch (err: any) {
    console.error('Error fetching achievements:', err);
    error.value = err.message || 'Failed to load achievements';
    achievements.value = [];
  } finally {
    loading.value = false;
  }
};
</script> 