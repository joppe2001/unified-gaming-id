<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" @keydown.esc="close" tabindex="0" ref="modalRef">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay with blur effect -->
      <div class="fixed inset-0 bg-gray-900 bg-opacity-90 backdrop-blur-sm transition-opacity" aria-hidden="true" @click="close"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-gray-800 bg-opacity-90 rounded-xl text-left overflow-hidden shadow-glow transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-gray-700">
        <!-- Background elements for modal -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <!-- Animated grid lines -->
          <div class="absolute inset-0 bg-grid-gaming opacity-10"></div>
          
          <!-- Glowing orb -->
          <div class="glow-orb absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-blue-500 opacity-10 blur-3xl"></div>
        </div>
        
        <div v-if="game" class="bg-gray-800 bg-opacity-90 relative z-10">
          <!-- Game header component -->
          <GameHeader :game="game" @close="close" />
          
          <!-- Achievements section -->
          <div class="px-6 py-4">
            <div class="mt-6">
              <div class="flex justify-between items-center mb-2">
                <h4 class="text-lg font-medium text-blue-300 gaming-text">Achievements</h4>
                <div class="flex flex-wrap items-center gap-2">
                  <button 
                    @click="refreshAchievements" 
                    class="text-xs bg-gray-900/70 text-blue-300 px-2 py-1 rounded-md flex items-center hover:bg-gray-700/70 border border-gray-700 transition-colors"
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
                    class="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-md flex items-center hover:bg-blue-800/50 border border-blue-700 transition-colors"
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
                  <button 
                    v-if="achievementsInfo.isPrivate"
                    @click="forceAchievements" 
                    class="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded-md flex items-center hover:bg-purple-800/50 border border-purple-700 transition-colors"
                    :disabled="loading || forcingAchievements"
                  >
                    <svg 
                      class="h-3 w-3 mr-1" 
                      :class="{ 'animate-spin': forcingAchievements }"
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {{ forcingAchievements ? 'Fetching...' : 'Bypass Privacy' }}
                  </button>
                  <div v-if="achievementsInfo.isPrivate" class="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded-md border border-yellow-700">
                    Private Profile Data
                  </div>
                  <div v-else-if="achievementsInfo.bypassedPrivacy" class="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded-md border border-purple-700">
                    Bypassed Privacy
                  </div>
                </div>
              </div>
              
              <!-- Privacy instructions component -->
              <PrivacyInstructions 
                v-if="achievementsInfo.isPrivate"
                :is-private="achievementsInfo.isPrivate"
                :bypassed-privacy="achievementsInfo.bypassedPrivacy"
                v-model:show-instructions="showPrivacyInstructions"
              />
              
              <!-- Achievement filters component -->
              <AchievementFilters 
                v-if="achievements.length > 0 && !loading"
                v-model:filter-status="filterStatus"
                v-model:sort-by="sortBy"
                v-model:sort-order="sortOrder"
                v-model:search-query="searchQuery"
                :has-unlock-times="hasUnlockTimes"
                :filtered-count="filteredAndSortedAchievements.length"
                :total-count="achievements.length"
              />
              
              <!-- Achievement list component -->
              <AchievementList 
                :achievements="filteredAndSortedAchievements"
                :loading="loading"
                :is-private="achievementsInfo.isPrivate"
              />
            </div>
          </div>
          
          <!-- Footer with debug panel -->
          <div class="px-6 py-3 bg-gray-900/50 border-t border-gray-700">
            <DebugPanel 
              :game="game"
              :achievements="achievements"
              :achievements-info="achievementsInfo"
              :loading="loading"
              :show="show"
              :checking-privacy="checkingPrivacy"
              :forcing-achievements="forcingAchievements"
              :privacy-info="privacyInfo"
              @close="close"
              @check-privacy="checkPrivacySettings"
              @force-achievements="forceAchievements"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Sticky close button for mobile -->
    <button 
      @click="close" 
      class="fixed bottom-4 right-4 md:hidden bg-gray-800 bg-opacity-70 rounded-full p-3 text-blue-300 hover:bg-gray-700 shadow-glow z-50 border border-gray-700"
      aria-label="Close"
    >
      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue';
import GameHeader from './GameHeader.vue';
import AchievementFilters from './AchievementFilters.vue';
import AchievementList from './AchievementList.vue';
import PrivacyInstructions from './PrivacyInstructions.vue';
import DebugPanel from './DebugPanel.vue';

// Define the Game interface
interface Game {
  appid: string | number;
  name: string;
  playtime_forever?: number;
  playtime_2weeks?: number;
  last_played?: number;
}

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  game: {
    type: Object as () => Game,
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
  isFallback: false,
  bypassedPrivacy: false,
  forced: false
});

// Check if any achievements have unlock times
const hasUnlockTimes = computed(() => {
  return achievements.value.some(a => a.unlocked && a.unlockTime);
});

// Add keyboard support for Escape key
const modalRef = ref<HTMLElement | null>(null);

onMounted(() => {
  // Focus the modal when it's mounted to enable keyboard events
  if (modalRef.value) {
    modalRef.value.focus();
  }
});

// Watch for show property changes
watch(() => props.show, (newShow) => {
  if (newShow && props.game?.appid) {
    fetchAchievements(props.game.appid);
    // Focus the modal when it's shown
    nextTick(() => {
      if (modalRef.value) {
        modalRef.value.focus();
      }
    });
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
    isFallback: false,
    bypassedPrivacy: false,
    forced: false
  };
  
  try {
    const response = await $fetch<{
      achievements?: any[];
      cached?: boolean;
      isPrivate?: boolean;
      hasAchievements?: boolean;
      isFallback?: boolean;
      bypassedPrivacy?: boolean;
      forced?: boolean;
    }>(`/api/steam/achievements?gameId=${gameId}${forceRefresh ? '&forceRefresh=true' : ''}`);
    
    if (response.achievements && Array.isArray(response.achievements)) {
      achievements.value = response.achievements;
      
      // Update achievement info
      achievementsInfo.value = {
        isPrivate: !!response.isPrivate,
        cached: !!response.cached,
        hasAchievements: response.hasAchievements !== false,
        isFallback: !!response.isFallback,
        bypassedPrivacy: !!response.bypassedPrivacy,
        forced: !!response.forced
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

// Close the modal
const close = () => {
  emit('close');
};

// Add a refreshAchievements function
const refreshAchievements = () => {
  if (props.game?.appid) {
    fetchAchievements(props.game.appid, true); // Pass true to force refresh
  }
};

// Add a checkAllAchievements function
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

// Add a checkPrivacySettings function
const checkingPrivacy = ref(false);
const privacyInfo = ref<any>(null);

const checkPrivacySettings = async () => {
  if (!props.game?.appid) return;
  
  checkingPrivacy.value = true;
  privacyInfo.value = null;
  
  try {
    const response = await $fetch<any>(`/api/steam/debug-profile?gameId=${props.game.appid}`);
  } catch (error) {
    console.error('Error checking privacy:', error);
    alert('Error checking privacy. See console for details.');
  } finally {
    checkingPrivacy.value = false;
  }
};

// Add a forceAchievements function
const forcingAchievements = ref(false);

const forceAchievements = async () => {
  if (!props.game?.appid) return;
  
  forcingAchievements.value = true;
  
  try {
    // Call the force-achievements endpoint
    const response = await $fetch<any>(`/api/steam/force-achievements?gameId=${props.game.appid}&bypassPrivacy=true`);
    
    if (response.achievements && Array.isArray(response.achievements)) {
      achievements.value = response.achievements;
      
      // Update achievement info
      achievementsInfo.value = {
        ...achievementsInfo.value,
        isPrivate: !!response.isPrivate,
        bypassedPrivacy: !!response.bypassedPrivacy,
        forced: true
      };
      
      // Show a message about the results
      const unlockedCount = achievements.value.filter(a => a.unlocked).length;
      alert(`Retrieved ${achievements.value.length} achievements directly from Steam API.\n${unlockedCount} achievements are unlocked.`);
    } else if (response.error) {
      alert(`Error: ${response.error}`);
    }
  } catch (error) {
    console.error('Error forcing achievements:', error);
    alert('Error forcing achievements. See console for details.');
  } finally {
    forcingAchievements.value = false;
  }
};

// Privacy instructions
const showPrivacyInstructions = ref(false);

// Filter and sort functionality
const filterStatus = ref('all');
const sortBy = ref('default');
const sortOrder = ref('asc');
const searchQuery = ref('');

// Add a watcher to log filter changes for debugging
watch([filterStatus, sortBy, sortOrder, searchQuery], ([newFilter, newSort, newOrder, newSearch]) => {
  console.log('Filter changed:', { 
    filter: newFilter, 
    sort: newSort, 
    order: newOrder, 
    search: newSearch 
  });
}, { deep: true });

const filteredAndSortedAchievements = computed(() => {
  // First filter by status
  let filtered = achievements.value.filter(a => {
    if (filterStatus.value === 'all') return true;
    if (filterStatus.value === 'unlocked' && a.unlocked) return true;
    if (filterStatus.value === 'locked' && !a.unlocked) return true;
    return false;
  });
  
  // Then filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(a => 
      a.name.toLowerCase().includes(query) || 
      a.description.toLowerCase().includes(query)
    );
  }

  // Then sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy.value === 'default') return 0;
    
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name);
    }
    
    if (sortBy.value === 'rarity') {
      return (b.globalPercentage || 0) - (a.globalPercentage || 0);
    }
    
    if (sortBy.value === 'date') {
      // Put unlocked achievements first, sorted by unlock time
      if (a.unlocked && b.unlocked) {
        return (b.unlockTime || 0) - (a.unlockTime || 0);
      }
      // Unlocked achievements come before locked ones
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      // Both locked, maintain default order
      return 0;
    }
    
    return 0;
  });

  // Apply sort order
  if (sortOrder.value === 'asc') {
    if (sortBy.value === 'date') {
      // For dates, we want newest first in desc, oldest first in asc
      return sorted.reverse();
    }
    return sorted;
  } else {
    if (sortBy.value === 'date') {
      // Already sorted newest first
      return sorted;
    }
    return sorted.reverse();
  }
});
</script> 