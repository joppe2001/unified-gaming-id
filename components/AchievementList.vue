<template>
  <div>
    <div v-if="loading" class="py-4 text-center text-gray-400">
      <svg class="animate-spin h-6 w-6 mx-auto text-blue-400 filter drop-shadow-glow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="mt-2 block">Loading achievements...</span>
    </div>
    <div v-else-if="achievements.length === 0" class="py-4 text-center text-gray-400">
      <svg class="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="mt-2">No achievements available for this game.</p>
    </div>
    <div v-else>
      <!-- Achievement stats -->
      <div v-if="achievements.length > 0" class="mb-4 bg-gray-900/50 p-3 rounded-lg border border-gray-700 shadow-glow">
        <div class="flex flex-wrap gap-4 justify-between">
          <div>
            <div class="text-sm font-medium text-gray-400">Total Achievements</div>
            <div class="text-xl font-semibold text-blue-300">{{ achievements.length }}</div>
          </div>
          <div v-if="!isPrivate">
            <div class="text-sm font-medium text-gray-400">Unlocked</div>
            <div class="text-xl font-semibold text-green-300">
              {{ unlockedCount }} 
              <span class="text-sm text-gray-500">({{ unlockedPercentage }}%)</span>
            </div>
          </div>
          <div v-if="!isPrivate && hasUnlockTimes">
            <div class="text-sm font-medium text-gray-400">Last Unlocked</div>
            <div class="text-xl font-semibold text-yellow-300">{{ formatDate(lastUnlockedTime) }}</div>
          </div>
        </div>
      </div>
      
      <!-- Achievement list -->
      <div class="mt-2 grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-1">
        <div 
          v-for="achievement in achievements" 
          :key="achievement.achievementId" 
          class="flex items-center p-3 rounded-lg border transition-colors"
          :class="achievement.unlocked 
            ? 'bg-green-900/30 border-green-700 hover:bg-green-900/40' 
            : 'bg-gray-900/50 border-gray-700 hover:bg-gray-800/50'"
        >
          <div class="flex-shrink-0 h-12 w-12 rounded overflow-hidden bg-gray-900 border border-gray-700">
            <img 
              :src="achievement.unlocked ? achievement.iconUrl : (achievement.iconGrayUrl || achievement.iconUrl)" 
              :alt="achievement.name" 
              class="h-full w-full object-cover" 
              @error="handleAchievementImageError"
            />
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium" :class="achievement.unlocked ? 'text-green-300' : 'text-gray-300'">
              {{ achievement.name }}
            </p>
            <p class="text-xs text-gray-400">{{ achievement.description }}</p>
            <div class="mt-1 flex items-center">
              <div class="flex-1">
                <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full" 
                    :class="achievement.unlocked ? 'bg-green-500' : 'bg-blue-600'"
                    :style="`width: ${achievement.globalPercentage || 0}%`"
                  ></div>
                </div>
              </div>
              <span class="ml-2 text-xs text-gray-400">{{ formatPercentage(achievement.globalPercentage) }}% of players</span>
            </div>
          </div>
          <div class="ml-4 flex flex-col items-end">
            <span 
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
              :class="achievement.unlocked 
                ? 'bg-green-900/50 text-green-300 border-green-700' 
                : 'bg-gray-900/50 text-gray-300 border-gray-700'"
            >
              {{ achievement.unlocked ? 'Unlocked' : 'Locked' }}
            </span>
            <span v-if="achievement.unlocked && achievement.unlockTime" class="text-xs text-gray-400 mt-1">
              {{ formatDate(achievement.unlockTime) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

// Define the Achievement interface
interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  iconUrl: string;
  iconGrayUrl?: string;
  unlocked: boolean;
  unlockTime?: number;
  globalPercentage?: number;
}

const props = defineProps({
  achievements: {
    type: Array as () => Achievement[],
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  }
});

// Calculate unlocked count
const unlockedCount = computed(() => {
  return props.achievements.filter(a => a.unlocked).length;
});

// Calculate unlocked percentage
const unlockedPercentage = computed(() => {
  if (!props.achievements.length) return 0;
  return Math.round((unlockedCount.value / props.achievements.length) * 100);
});

// Check if any achievements have unlock times
const hasUnlockTimes = computed(() => {
  return props.achievements.some(a => a.unlocked && a.unlockTime);
});

// Get the most recent unlock time
const lastUnlockedTime = computed(() => {
  if (!props.achievements.length) return 0;
  
  const unlockedAchievements = props.achievements
    .filter(a => a.unlocked && a.unlockTime)
    .sort((a, b) => (b.unlockTime || 0) - (a.unlockTime || 0));
  
  return unlockedAchievements.length ? unlockedAchievements[0].unlockTime : 0;
});

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

// Format percentage
const formatPercentage = (value: number | undefined) => {
  if (value === undefined || value === null || isNaN(Number(value))) return '0.0';
  return Number(value).toFixed(1);
};

// Handle achievement image errors
const handleAchievementImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/images/achievement-placeholder.png';
};
</script> 