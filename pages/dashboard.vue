<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div v-if="loading && !error" class="text-center py-10">
      <div class="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
      <p class="text-xl">Loading...</p>
    </div>
    
    <div v-else-if="error" class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 my-10">
      <div class="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3 class="text-lg font-semibold mb-2">Error</h3>
        <p>{{ error }}</p>
      </div>
      <p class="mb-4">There was a problem with the authentication system. Please check your configuration or try again later.</p>
      <div class="flex gap-4">
        <button 
          @click="window.location.reload()" 
          class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Retry
        </button>
        <NuxtLink 
          to="/login" 
          class="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-center"
        >
          Back to Login
        </NuxtLink>
      </div>
    </div>
    
    <div v-else-if="!user" class="text-center py-10">
      <p class="text-xl mb-4">You need to be logged in to access this page</p>
      <NuxtLink to="/login" class="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        Go to Login
      </NuxtLink>
    </div>
    
    <div v-else class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
      
      <!-- Firestore Setup Guide -->
      <div v-if="showFirestoreSetupGuide" class="mb-6">
        <FirestoreSetupGuide />
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MainUserProfile />
        
        <div class="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold mb-4">Game Accounts</h2>
          <p class="text-gray-600 mb-4">Connect your gaming accounts to create a unified gaming profile.</p>
          
          <div class="space-y-4">
            <div class="p-4 border rounded-lg">
              <h3 class="text-xl font-semibold mb-2">Steam</h3>
              
              <div v-if="profile?.connectedAccounts?.steam" class="flex items-center mb-4">
                <img 
                  :src="profile.connectedAccounts.steam.avatarUrl" 
                  alt="Steam Avatar" 
                  class="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p class="font-medium">{{ profile.connectedAccounts.steam.personaName }}</p>
                  <p class="text-sm text-gray-600">Connected on {{ formatDate(profile.connectedAccounts.steam.connectedAt) }}</p>
                </div>
              </div>
              
              <SteamLogin />
              
              <div v-if="profile?.connectedAccounts?.steam" class="mt-4">
                <button 
                  @click="fetchGames" 
                  class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
                  :disabled="gamesLoading"
                >
                  {{ games.length ? 'Refresh Games' : 'Load Games' }}
                  <span v-if="gamesLoading" class="ml-2 inline-block">
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="games.length" class="mt-6">
            <h3 class="text-xl font-semibold mb-4">Your Steam Games</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="game in games" :key="game.appid" class="border rounded-lg overflow-hidden">
                <img :src="`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`" :alt="game.name" class="w-full h-40 object-cover" />
                <div class="p-4">
                  <h3 class="font-medium text-lg">{{ game.name }}</h3>
                  <p class="text-gray-600">{{ formatPlaytime(game.playtime_forever) }}</p>
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
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useFirebase } from '~/composables/useFirebase';

const router = useRouter();
const route = useRoute();
const { user, loading, error } = useFirebase();

const profile = ref(null);
const games = ref([]);
const gamesLoading = ref(false);
const showFirestoreSetupGuide = computed(() => route.query.error === 'firestore_not_enabled');

// Redirect to login if not authenticated
watch([user, loading], ([newUser, isLoading]) => {
  if (!isLoading && !newUser && !error) {
    navigateTo('/login');
  } else if (newUser && !isLoading) {
    fetchProfile();
  }
});

// Fetch user profile
const fetchProfile = async () => {
  try {
    profile.value = await $fetch('/api/user/profile');
  } catch (error) {
    console.error('Error fetching profile:', error);
    // Set a default empty profile to prevent errors
    profile.value = {
      uid: user.value?.uid,
      email: user.value?.email,
      displayName: user.value?.displayName,
      photoURL: user.value?.photoURL,
      connectedAccounts: {}
    };
  }
};

// Fetch Steam games
const fetchGames = async () => {
  if (!profile.value?.connectedAccounts?.steam) return;
  
  gamesLoading.value = true;
  try {
    const response = await $fetch('/api/steam/games');
    games.value = response.games || [];
  } catch (error) {
    console.error('Error fetching games:', error);
  } finally {
    gamesLoading.value = false;
  }
};

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
  if (!timestamp) return 'Unknown date';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};
</script> 