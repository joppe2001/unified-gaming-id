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
              @error="handleImageError"
              ref="gameHeaderImage"
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
              <div class="flex justify-between items-center mb-2">
                <h4 class="text-lg font-medium text-gray-900">Achievements</h4>
                <div class="flex items-center space-x-2">
                  <button 
                    @click="refreshAchievements" 
                    class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center hover:bg-gray-200"
                    :disabled="loading"
                  >
                    <svg 
                      class="h-3 w-3 mr-1" 
                      :class="{ 'animate-spin': loading }"
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {{ loading ? 'Loading...' : 'Refresh' }}
                  </button>
                  <button 
                    @click="checkAllAchievements" 
                    class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center hover:bg-blue-200"
                    :disabled="loading || checkingAll"
                  >
                    <svg 
                      class="h-3 w-3 mr-1" 
                      :class="{ 'animate-spin': checkingAll }"
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ checkingAll ? 'Checking...' : 'Verify All' }}
                  </button>
                  <div v-if="achievementsInfo.isPrivate" class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Private Profile Data
                  </div>
                  <div v-else-if="achievementsInfo.cached" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Cached Data
                  </div>
                </div>
              </div>
              
              <div v-if="loading" class="py-4 text-center text-gray-500">
                <svg class="animate-spin h-6 w-6 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="mt-2 block">Loading achievements...</span>
              </div>
              <div v-else-if="achievements.length === 0" class="py-4 text-center text-gray-500">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="mt-2">No achievements available for this game.</p>
              </div>
              <div v-else>
                <!-- Achievement stats -->
                <div v-if="achievements.length > 0" class="mb-4 bg-gray-50 p-3 rounded-lg">
                  <div class="flex flex-wrap gap-4 justify-between">
                    <div>
                      <div class="text-sm font-medium text-gray-500">Total Achievements</div>
                      <div class="text-xl font-semibold text-gray-900">{{ achievements.length }}</div>
                    </div>
                    <div v-if="!achievementsInfo.isPrivate">
                      <div class="text-sm font-medium text-gray-500">Unlocked</div>
                      <div class="text-xl font-semibold text-gray-900">
                        {{ achievements.filter(a => a.unlocked).length }} 
                        <span class="text-sm text-gray-500">({{ unlockedPercentage }}%)</span>
                      </div>
                    </div>
                    <div v-if="!achievementsInfo.isPrivate && hasUnlockTimes">
                      <div class="text-sm font-medium text-gray-500">Last Unlocked</div>
                      <div class="text-xl font-semibold text-gray-900">{{ formatDate(lastUnlockedTime) }}</div>
                    </div>
                  </div>
                </div>
                
                <!-- Achievement list -->
                <div class="mt-2 grid grid-cols-1 gap-2">
                  <div 
                    v-for="achievement in achievements" 
                    :key="achievement.achievementId" 
                    class="flex items-center p-3 rounded-md"
                    :class="achievement.unlocked ? 'bg-green-50' : 'bg-gray-50'"
                  >
                    <div class="flex-shrink-0 h-12 w-12 rounded overflow-hidden bg-gray-200">
                      <img 
                        :src="achievement.unlocked ? achievement.iconUrl : (achievement.iconGrayUrl || achievement.iconUrl)" 
                        :alt="achievement.name" 
                        class="h-full w-full object-cover" 
                        @error="(e) => handleAchievementImageError(e)"
                      />
                    </div>
                    <div class="ml-3 flex-1">
                      <p class="text-sm font-medium" :class="achievement.unlocked ? 'text-green-800' : 'text-gray-700'">
                        {{ achievement.name }}
                      </p>
                      <p class="text-xs text-gray-500">{{ achievement.description }}</p>
                      <div class="mt-1 flex items-center">
                        <div class="flex-1">
                          <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              class="h-full rounded-full" 
                              :class="achievement.unlocked ? 'bg-green-500' : 'bg-blue-400'"
                              :style="`width: ${achievement.globalPercentage || 0}%`"
                            ></div>
                          </div>
                        </div>
                        <span class="ml-2 text-xs text-gray-500">{{ formatPercentage(achievement.globalPercentage) }}% of players</span>
                      </div>
                    </div>
                    <div class="ml-4 flex flex-col items-end">
                      <span 
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        :class="achievement.unlocked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                      >
                        {{ achievement.unlocked ? 'Unlocked' : 'Locked' }}
                      </span>
                      <span v-if="achievement.unlocked && achievement.unlockTime" class="text-xs text-gray-500 mt-1">
                        {{ formatDate(achievement.unlockTime) }}
                      </span>
                      <button 
                        @click="checkAchievement(achievement.achievementId)"
                        class="text-xs text-blue-600 hover:text-blue-800 mt-1"
                        :disabled="checkingAchievement === achievement.achievementId"
                      >
                        {{ checkingAchievement === achievement.achievementId ? 'Checking...' : 'Verify' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="px-6 py-3 bg-gray-50 text-right">
            <!-- Debug info -->
            <div v-if="showDebugInfo" class="text-left mb-4 p-2 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-60">
              <div><strong>Debug Info:</strong></div>
              <div>Loading: {{ loading }}</div>
              <div>Show: {{ show }}</div>
              <div>Game ID: {{ game?.appid }}</div>
              <div>Achievements: {{ achievements.length }}</div>
              <div>Cached: {{ achievementsInfo.cached }}</div>
              <div>Private: {{ achievementsInfo.isPrivate }}</div>
              <div>Fallback: {{ achievementsInfo.isFallback }}</div>
              <div v-if="achievements.length > 0">
                <div class="mt-2"><strong>Sample Achievement:</strong></div>
                <pre>{{ JSON.stringify(achievements[0], null, 2) }}</pre>
              </div>
            </div>
            
            <div class="flex justify-between">
              <button 
                @click="showDebugInfo = !showDebugInfo" 
                class="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {{ showDebugInfo ? 'Hide Debug' : 'Show Debug' }}
              </button>
              
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
  </div>
</template>

<script setup lang="ts">
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
const achievements = ref<any[]>([]);
const achievementsInfo = ref({
  isPrivate: false,
  cached: false,
  hasAchievements: true,
  isFallback: false
});

// Calculate unlocked percentage
const unlockedPercentage = computed(() => {
  if (!achievements.value.length) return 0;
  const unlocked = achievements.value.filter(a => a.unlocked).length;
  return Math.round((unlocked / achievements.value.length) * 100);
});

// Check if any achievements have unlock times
const hasUnlockTimes = computed(() => {
  return achievements.value.some(a => a.unlocked && a.unlockTime);
});

// Get the most recent unlock time
const lastUnlockedTime = computed(() => {
  if (!achievements.value.length) return 0;
  
  const unlockedAchievements = achievements.value
    .filter(a => a.unlocked && a.unlockTime)
    .sort((a, b) => b.unlockTime - a.unlockTime);
  
  return unlockedAchievements.length ? unlockedAchievements[0].unlockTime : 0;
});

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

// Format percentage
const formatPercentage = (value: number | undefined) => {
  if (value === undefined || value === null || isNaN(Number(value))) return '0.0';
  return Number(value).toFixed(1);
};

// Handle image loading errors
const gameHeaderImage = ref<HTMLImageElement | null>(null);
const handleImageError = () => {
  if (gameHeaderImage.value) {
    gameHeaderImage.value.src = '/images/game-placeholder.jpg';
  }
};

// Handle achievement image errors
const handleAchievementImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/images/achievement-placeholder.png';
};

// Close the modal
const close = () => {
  emit('close');
};

// Watch for show property changes
watch(() => props.show, (newShow) => {
  
  if (newShow && props.game?.appid) {
    fetchAchievements(props.game.appid);
  } else if (!newShow) {
    // Reset state when modal is closed
    setTimeout(() => {
      achievements.value = [];
      loading.value = false;
    }, 300);
  }
}, { immediate: true });

// Fetch achievements when game changes
watch(() => props.game, async (newGame) => {
  
  if (newGame && props.show) {
    if (!newGame.appid) {
      console.warn('Game object is missing appid property:', newGame);
      loading.value = false;
      return;
    }
    
    await fetchAchievements(newGame.appid);
  } else if (!newGame && props.show) {
    console.warn('Game object is null or undefined but modal is shown');
    loading.value = false;
    achievements.value = [];
  }
}, { immediate: true });

// Fetch achievements for a game
const fetchAchievements = async (gameId: string | number, forceRefresh = false) => {
  if (!gameId) {
    console.warn('Cannot fetch achievements: No game ID provided');
    loading.value = false;
    return;
  }
  
  loading.value = true;
  achievements.value = []; // Reset achievements
  achievementsInfo.value = {
    isPrivate: false,
    cached: false,
    hasAchievements: true,
    isFallback: false
  };
  
  try {
    const response = await $fetch<{
      achievements?: any[];
      cached?: boolean;
      isPrivate?: boolean;
      hasAchievements?: boolean;
      isFallback?: boolean;
    }>(`/api/steam/achievements?gameId=${gameId}${forceRefresh ? '&forceRefresh=true' : ''}`);
    
    // Add detailed logging for debugging
    console.log('Achievement API response:', {
      gameId,
      hasAchievements: response.achievements && response.achievements.length > 0,
      isPrivate: !!response.isPrivate,
      cached: !!response.cached,
      isFallback: !!response.isFallback,
      sampleAchievement: response.achievements && response.achievements.length > 0 ? response.achievements[0] : null
    });
    
    if (response.achievements && Array.isArray(response.achievements)) {
      achievements.value = response.achievements;
      
      // Update achievement info
      achievementsInfo.value = {
        isPrivate: !!response.isPrivate,
        cached: !!response.cached,
        hasAchievements: response.hasAchievements !== false,
        isFallback: !!response.isFallback
      };
      
    } else {
      console.warn('Invalid achievements data format:', response);
      achievements.value = [];
    }
  } catch (error) {
    console.error('Error fetching achievements:', error);
    
    // More informative fallback data
    achievements.value = [
      {
        achievementId: 'error',
        name: 'Achievement data unavailable',
        description: 'Could not retrieve achievements for this game. The game may not have achievements or they may be private.',
        iconUrl: '/images/achievement-placeholder.png',
        unlocked: false,
        globalPercentage: 0
      }
    ];
    
    achievementsInfo.value.isFallback = true;
  } finally {
    loading.value = false;
  }
};

// Debug flag
const showDebugInfo = ref(false);

// Add a refreshAchievements function
const refreshAchievements = () => {
  if (props.game?.appid) {
    fetchAchievements(props.game.appid, true); // Pass true to force refresh
  }
};

// Add a checkAchievement function
const checkingAchievement = ref<string | null>(null);
const checkedAchievement = ref<any>(null);

const checkAchievement = async (achievementId: string) => {
  if (!props.game?.appid) return;
  
  checkingAchievement.value = achievementId;
  checkedAchievement.value = null;
  
  try {
    const response = await $fetch<any>(`/api/steam/check-achievement?gameId=${props.game.appid}&achievementId=${achievementId}`);
    
    console.log('Achievement check result:', response);
    checkedAchievement.value = response;
    
    // Show the result in an alert for now
    alert(`Achievement "${response.achievement.name}" is ${response.achievement.unlocked ? 'UNLOCKED' : 'LOCKED'} according to Steam API directly.`);
    
    // Update the achievement in the list if it's different
    const index = achievements.value.findIndex(a => a.achievementId === achievementId);
    if (index !== -1 && achievements.value[index].unlocked !== response.achievement.unlocked) {
      achievements.value[index].unlocked = response.achievement.unlocked;
      achievements.value[index].unlockTime = response.achievement.unlockTime;
    }
  } catch (error) {
    console.error('Error checking achievement:', error);
    alert('Error checking achievement status. See console for details.');
  } finally {
    checkingAchievement.value = null;
  }
};

// Add checkAllAchievements function
const checkingAll = ref(false);

const checkAllAchievements = async () => {
  if (!props.game?.appid || achievements.value.length === 0) return;
  
  checkingAll.value = true;
  
  try {
    // Force refresh achievements directly from Steam API
    await fetchAchievements(props.game.appid, true);
    
    // Show a message about the results
    const unlockedCount = achievements.value.filter(a => a.unlocked).length;
    alert(`Verified ${achievements.value.length} achievements directly from Steam API.\n${unlockedCount} achievements are unlocked.`);
  } catch (error) {
    console.error('Error checking all achievements:', error);
    alert('Error checking all achievements. See console for details.');
  } finally {
    checkingAll.value = false;
  }
};
</script> 