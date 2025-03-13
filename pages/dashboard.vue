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
          
          <!-- Add link to gaming stats page -->
          <div v-if="profile?.connectedAccounts?.steam" class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-blue-800 font-medium">Steam account connected!</p>
                <p class="text-sm text-blue-600">View your gaming statistics and achievements.</p>
              </div>
              <NuxtLink 
                to="/gaming-stats" 
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
              >
                <span>View Stats</span>
                <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </NuxtLink>
            </div>
          </div>
          
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
            </div>
            
            <div class="p-4 border rounded-lg">
              <h3 class="text-xl font-semibold mb-2">Riot Games</h3>
              <RiotLogin :profile="profile" />
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

const profile: Ref<any> = ref(null);
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
    // Handle Firestore timestamp objects
    let date;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      // This is a Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp._seconds !== undefined) {
      // This is a serialized Firestore Timestamp
      date = new Date(timestamp._seconds * 1000);
    } else if (typeof timestamp === 'object' && timestamp instanceof Date) {
      // This is already a Date object
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      // This is a Unix timestamp in seconds
      date = new Date(timestamp * 1000);
    } else if (typeof timestamp === 'string') {
      // This is a date string
      date = new Date(timestamp);
    } else {
      // Try to convert to date as a fallback
      date = new Date(timestamp);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value:', timestamp);
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error, timestamp);
    return 'Invalid date';
  }
};
</script> 