<template>
  <div class="bg-gray-800 bg-opacity-70 rounded-xl shadow-glow border border-gray-700 overflow-hidden backdrop-blur-sm">
    <div class="relative">
      <!-- Profile Banner -->
      <div class="h-32 bg-gradient-to-r from-blue-900 to-indigo-900 relative overflow-hidden">
        <!-- Decorative elements -->
        <div class="absolute top-0 right-0 w-24 h-24 bg-blue-400 rounded-full opacity-20 blur-lg pulse-slow"></div>
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-purple-400 rounded-full opacity-20 blur-lg pulse-slow-delayed"></div>
        
        <!-- Grid overlay -->
        <div class="absolute inset-0 bg-grid-gaming opacity-30"></div>
      </div>
      
      <!-- Profile Avatar -->
      <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
        <div class="relative">
          <img 
            :src="user?.photoURL || 'https://api.dicebear.com/6.x/bottts/svg?seed=' + (user?.displayName || user?.email || 'default')" 
            alt="Profile Avatar" 
            class="w-24 h-24 rounded-full border-4 border-gray-800 object-cover shadow-glow"
          />
          <div class="absolute inset-0 rounded-full border-2 border-blue-400 opacity-50 animate-pulse"></div>
        </div>
      </div>
    </div>
    
    <!-- Profile Info -->
    <div class="pt-16 pb-6 px-6 text-center">
      <h2 class="text-xl font-bold text-white mb-1">{{ user?.displayName || 'Gamer' }}</h2>
      <p class="text-gray-400 text-sm mb-4">{{ user?.email }}</p>
      
      <!-- Stats -->
      <div class="grid grid-cols-3 gap-2 mb-6">
        <div class="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
          <div class="text-2xl font-bold text-blue-400">{{ connectedPlatformsCount }}</div>
          <div class="text-xs text-gray-400">Platforms</div>
        </div>
        <div class="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
          <div v-if="gamesLoading" class="flex justify-center items-center h-8">
            <div class="loading-spinner-tiny">
              <div class="spinner-inner-tiny"></div>
            </div>
          </div>
          <div v-else class="text-2xl font-bold text-purple-400">{{ gamesCount }}</div>
          <div class="text-xs text-gray-400">Games</div>
        </div>
        <div class="bg-gray-900/50 p-2 sm:p-3 rounded-lg border border-gray-700">
          <div v-if="gamesLoading" class="flex justify-center items-center h-8">
            <div class="loading-spinner-tiny">
              <div class="spinner-inner-tiny"></div>
            </div>
          </div>
          <div v-else class="text-2xl font-bold text-green-400">{{ achievementsCount }}</div>
          <div class="text-[10px] text-gray-400 relative top-1.5">Achievements</div>
        </div>
      </div>
      
      <!-- Profile Actions -->
      <div class="flex flex-col space-y-2">
        <NuxtLink 
          to="/profile" 
          class="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center justify-center relative overflow-hidden group"
        >
          <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 group-hover:-translate-x-full"></span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit Profile
        </NuxtLink>
        <button 
          @click="logout" 
          class="w-full py-2 px-4 bg-red-900/50 hover:bg-red-800 text-white rounded-lg transition flex items-center justify-center relative overflow-hidden group"
        >
          <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 group-hover:-translate-x-full"></span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import type { Ref } from 'vue';
import { useFirebase } from '~/composables/useFirebase';

// Define the profile type
interface UserProfile {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt?: Date;
  connectedAccounts?: {
    steam?: {
      steamId: string;
      personaName: string;
      avatarUrl: string;
      profileUrl: string;
      connectedAt: Date;
    };
    riot?: Record<string, any>;
    [key: string]: any;
  };
  // Add these for error responses
  statusCode?: number;
  body?: {
    error?: string;
    [key: string]: any;
  };
}

const { user, signOut } = useFirebase();
const profile = inject<Ref<UserProfile | null>>('profile', ref(null));

// Computed properties for stats
const connectedPlatformsCount = computed(() => {
  if (!profile.value?.connectedAccounts) return 0;
  return Object.keys(profile.value.connectedAccounts).length;
});

// Inject games from parent component
const games = inject<Ref<any[]>>('games', ref([]));
const gamesLoading = inject<Ref<boolean>>('gamesLoading', ref(false));

const gamesCount = computed(() => {
  return games.value?.length || 0;
});

const achievementsCount = computed(() => {
  // Calculate total achievements across all games
  let total = 0;
  
  // If we have games with achievements, count them
  games.value?.forEach(game => {
    if (game.achievements) {
      // If achievements is an array, count its length
      if (Array.isArray(game.achievements)) {
        total += game.achievements.length;
      }
      // If it's a number, add it directly
      else if (typeof game.achievements === 'number') {
        total += game.achievements;
      }
      // If it has an unlocked property that's a number, add it
      else if (game.achievements.unlocked && typeof game.achievements.unlocked === 'number') {
        total += game.achievements.unlocked;
      }
    }
  });
  
  return total;
});

// Logout function
const logout = async () => {
  try {
    await signOut();
    navigateTo('/login');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};
</script>

<style scoped>
.bg-grid-gaming {
  background-image: 
    linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.shadow-glow {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.gaming-text {
  background: linear-gradient(90deg, #60a5fa, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pulse-slow {
  animation: pulse 4s infinite alternate;
}

.pulse-slow-delayed {
  animation: pulse 4s infinite alternate-reverse;
}

@keyframes pulse {
  0% {
    opacity: 0.1;
    transform: scale(0.95);
  }
  100% {
    opacity: 0.3;
    transform: scale(1.05);
  }
}

.loading-spinner-tiny {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: conic-gradient(transparent 0%, rgba(59, 130, 246, 0.8));
  -webkit-mask: radial-gradient(circle at center, transparent 55%, white 55%);
  mask: radial-gradient(circle at center, transparent 55%, white 55%);
  animation: spin 1.5s linear infinite;
}

.spinner-inner-tiny {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #60a5fa;
  top: calc(50% - 2px);
  left: calc(50% - 2px);
  box-shadow: 0 0 5px 1px rgba(96, 165, 250, 0.6);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 