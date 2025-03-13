<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" @keydown.esc="close" tabindex="0" ref="modalRef">
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
                  <button 
                    v-if="achievementsInfo.isPrivate"
                    @click="forceAchievements" 
                    class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center hover:bg-purple-200"
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
                  <div v-if="achievementsInfo.isPrivate" class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Private Profile Data
                  </div>
                  <div v-else-if="achievementsInfo.bypassedPrivacy" class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    Bypassed Privacy
                  </div>
                  <div v-else-if="achievementsInfo.cached" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Cached Data
                  </div>
                </div>
              </div>
              
              <!-- Privacy settings instructions -->
              <div v-if="!showPrivacyInstructions" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p class="text-sm text-yellow-800">
                  <strong>Steam Privacy Settings:</strong> Your achievements are currently private. You can fix this or use the "Bypass Privacy" button above.
                </p>
                <button 
                  @click="showPrivacyInstructions = true" 
                  class="mt-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-300"
                >
                  Show How to Fix
                </button>
              </div>
              
              <div v-if="showPrivacyInstructions" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div class="flex justify-between items-start">
                  <h5 class="font-medium text-yellow-800">How to Fix Steam Privacy Settings</h5>
                  <button 
                    @click="showPrivacyInstructions = false" 
                    class="text-yellow-500 hover:text-yellow-700"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ol class="mt-2 text-sm text-yellow-800 list-decimal pl-5 space-y-1">
                  <li>Go to your <a href="https://steamcommunity.com/my/edit/settings" target="_blank" class="text-blue-600 hover:underline">Steam Profile Privacy Settings</a></li>
                  <li>Set "Game details" to "Public"</li>
                  <li><strong>Important:</strong> Make sure the checkbox "Always keep my total playtime private even if users can see my game details" is <strong>UNCHECKED</strong></li>
                  <li>Click "Save Changes" at the bottom of the page</li>
                  <li>Wait a few minutes for Steam to update your settings</li>
                  <li>Return here and click "Refresh" to update your achievements</li>
                </ol>
                <div class="mt-3 p-2 bg-blue-50 rounded-md text-xs text-blue-800">
                  <p><strong>Note:</strong> Steam's API error message is: "Profile is not public" - This specifically refers to your game statistics being private, not your entire profile.</p>
                  <p class="mt-1">If you've already set everything to public, try waiting 24 hours as Steam can take time to update privacy settings in their API.</p>
                </div>
              </div>
              
              <!-- Bypassed privacy warning -->
              <div v-if="achievementsInfo.bypassedPrivacy" class="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                <p class="text-sm text-purple-800">
                  <strong>Note:</strong> Your achievements are being shown with bypassed privacy settings. The unlocked status may not be accurate.
                  For accurate achievement data, please update your <a href="https://steamcommunity.com/my/edit/settings" target="_blank" class="text-blue-600 hover:underline">Steam privacy settings</a>.
                </p>
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
                
                <!-- Achievement filters -->
                <div class="mb-4 flex flex-wrap gap-2 items-center">
                  <div class="text-sm font-medium text-gray-700">Filter:</div>
                  <div class="flex flex-wrap gap-2">
                    <button 
                      @click="filterStatus = 'all'" 
                      class="text-xs px-2 py-1 rounded"
                      :class="filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    >
                      All
                    </button>
                    <button 
                      @click="filterStatus = 'unlocked'" 
                      class="text-xs px-2 py-1 rounded"
                      :class="filterStatus === 'unlocked' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    >
                      Unlocked
                    </button>
                    <button 
                      @click="filterStatus = 'locked'" 
                      class="text-xs px-2 py-1 rounded"
                      :class="filterStatus === 'locked' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    >
                      Locked
                    </button>
                  </div>
                  
                  <div class="text-sm font-medium text-gray-700 ml-4">Sort by:</div>
                  <div class="flex flex-wrap gap-2">
                    <button 
                      @click="sortBy = 'default'" 
                      class="text-xs px-2 py-1 rounded"
                      :class="sortBy === 'default' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    >
                      Default
                    </button>
                    <button 
                      @click="sortBy = 'name'" 
                      class="text-xs px-2 py-1 rounded"
                      :class="sortBy === 'name' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    >
                      Name
                    </button>
                    <button 
                      @click="sortBy = 'rarity'" 
                      class="text-xs px-2 py-1 rounded"
                      :class="sortBy === 'rarity' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    >
                      Rarity
                    </button>
                    <button 
                      v-if="hasUnlockTimes"
                      @click="sortBy = 'date'" 
                      class="text-xs px-2 py-1 rounded"
                      :class="sortBy === 'date' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    >
                      Unlock Date
                    </button>
                  </div>
                  
                  <button 
                    @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'" 
                    class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center hover:bg-gray-200 ml-2"
                  >
                    <svg 
                      class="h-3 w-3 mr-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      :class="{ 'transform rotate-180': sortOrder === 'desc' }"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    {{ sortOrder === 'asc' ? 'Ascending' : 'Descending' }}
                  </button>
                </div>
                
                <!-- Search filter -->
                <div class="mb-4">
                  <div class="relative">
                    <input 
                      type="text" 
                      v-model="searchQuery" 
                      placeholder="Search achievements..." 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg 
                        class="h-4 w-4 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <!-- Achievement count after filtering -->
                <div v-if="filteredAndSortedAchievements.length !== achievements.length" class="mb-4 text-sm text-gray-600">
                  Showing {{ filteredAndSortedAchievements.length }} of {{ achievements.length }} achievements
                </div>
                
                <!-- Achievement list -->
                <div class="mt-2 grid grid-cols-1 gap-2">
                  <div 
                    v-for="achievement in filteredAndSortedAchievements" 
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
              <div>Bypassed Privacy: {{ achievementsInfo.bypassedPrivacy }}</div>
              <div>Forced: {{ achievementsInfo.forced }}</div>
              <div>Unlocked: {{ achievements.filter(a => a.unlocked).length }}</div>
              <div v-if="achievements.length > 0">
                <div class="mt-2"><strong>Sample Achievement:</strong></div>
                <pre>{{ JSON.stringify(achievements[0], null, 2) }}</pre>
              </div>
              
              <div class="mt-2">
                <button 
                  @click="checkPrivacySettings" 
                  class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 mr-2"
                  :disabled="checkingPrivacy"
                >
                  {{ checkingPrivacy ? 'Checking...' : 'Check Privacy Settings' }}
                </button>
                
                <button 
                  @click="forceAchievements" 
                  class="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                  :disabled="forcingAchievements"
                >
                  {{ forcingAchievements ? 'Forcing...' : 'Force Achievements' }}
                </button>
              </div>
              
              <div v-if="privacyInfo" class="mt-2 p-2 bg-white rounded">
                <div><strong>Privacy Check Results:</strong></div>
                <div v-if="privacyInfo.errors.length > 0" class="text-red-500">
                  <div v-for="(error, index) in privacyInfo.errors" :key="index">
                    - {{ error }}
                  </div>
                </div>
                <div v-else class="text-green-500">
                  Your Steam profile appears to be correctly configured.
                </div>
                
                <div v-if="privacyInfo.privacyInstructions" class="mt-2 text-blue-600">
                  <div v-for="(instruction, index) in privacyInfo.privacyInstructions" :key="index">
                    {{ instruction }}
                  </div>
                </div>
                
                <div v-if="privacyInfo.profileInfo" class="mt-2">
                  <div><strong>Profile Info:</strong></div>
                  <div>Visibility: {{ getVisibilityText(privacyInfo.profileInfo.communityvisibilitystate) }}</div>
                  <div>Profile URL: <a :href="privacyInfo.profileInfo.profileurl" target="_blank" class="text-blue-500 hover:underline">{{ privacyInfo.profileInfo.personaname }}</a></div>
                </div>
                
                <div v-if="privacyInfo.achievementsInfo" class="mt-2">
                  <div><strong>Achievements Info:</strong></div>
                  <div>Success: {{ privacyInfo.achievementsInfo.success ? 'Yes' : 'No' }}</div>
                  <div>Game: {{ privacyInfo.achievementsInfo.gameName }}</div>
                  <div>Achievement Count: {{ privacyInfo.achievementsInfo.achievementCount }}</div>
                </div>
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
    
    <!-- Sticky close button for mobile -->
    <button 
      @click="close" 
      class="fixed bottom-4 right-4 md:hidden bg-gray-800 bg-opacity-70 rounded-full p-3 text-white hover:bg-opacity-100 shadow-lg"
      aria-label="Close"
    >
      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';

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
  isFallback: false,
  bypassedPrivacy: false,
  forced: false
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

// Debug flag
const showDebugInfo = ref(false);

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
    
    console.log('Privacy check result:', response);
    privacyInfo.value = response;
  } catch (error) {
    console.error('Error checking privacy:', error);
    alert('Error checking privacy. See console for details.');
  } finally {
    checkingPrivacy.value = false;
  }
};

// Add a getVisibilityText function
const getVisibilityText = (visibility: number) => {
  switch (visibility) {
    case 1:
      return 'Private';
    case 2:
      return 'Friends Only';
    case 3:
      return 'Public';
    default:
      return `Unknown (${visibility})`;
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
    
    console.log('Force achievements response:', response);
    
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