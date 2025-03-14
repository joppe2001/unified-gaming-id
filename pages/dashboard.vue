<template>
  <div class="h-auto bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading && !error" class="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
      <div class="text-center p-6 rounded-lg">
        <div class="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent mx-auto mb-4"></div>
        <p class="text-lg font-medium text-gray-700">Loading your gaming profile...</p>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 my-10">
      <div class="p-4 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        <h3 class="text-lg font-semibold mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Error
        </h3>
        <p>{{ error }}</p>
      </div>
      <p class="mb-4 text-gray-600">There was a problem with the authentication system. Please check your configuration or try again later.</p>
      <div class="flex gap-4">
        <button 
          @click="refreshPage" 
          class="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
          Retry
        </button>
        <NuxtLink 
          to="/login" 
          class="flex-1 py-2.5 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-center flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
          </svg>
          Back to Login
        </NuxtLink>
      </div>
    </div>
    
    <!-- Not Logged In State -->
    <div v-else-if="!user" class="flex flex-col items-center justify-center min-h-screen p-4">
      <div class="text-center max-w-md bg-white p-8 rounded-xl shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
        </svg>
        <h2 class="text-2xl font-bold mb-2">Authentication Required</h2>
        <p class="text-gray-600 mb-6">You need to be logged in to access your gaming dashboard</p>
        <NuxtLink to="/login" class="py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
          </svg>
          Go to Login
        </NuxtLink>
      </div>
    </div>
    
    <!-- Dashboard Content -->
    <div v-else class="container mx-auto px-4 py-6 max-w-6xl">
      <!-- Header -->
      <header class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 class="text-3xl font-bold text-gray-900 mb-2 sm:mb-0">Gaming Dashboard</h1>
          <div class="flex items-center space-x-2">
            <button 
              @click="refreshPage" 
              class="p-2 text-gray-500 hover:text-blue-600 transition rounded-full hover:bg-gray-100"
              title="Refresh"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
              </svg>
            </button>
            <!-- Desktop Logout Button (visible only on desktop) -->
            <button 
              @click="logout" 
              class="hidden sm:inline-flex items-center p-2 text-gray-500 hover:text-red-600 transition rounded-full hover:bg-gray-100"
              title="Sign Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
              </svg>
            </button>
            <!-- Mobile Logout Button (visible only on mobile) -->
            <button 
              @click="logout" 
              class="sm:hidden inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              aria-label="Sign Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>
      
      <!-- Firestore Setup Guide -->
      <div v-if="showFirestoreSetupGuide" class="mb-8">
        <FirestoreSetupGuide />
      </div>
      
      <!-- User Profile Card (Moved to top on mobile) -->
      <div class="mb-6 lg:hidden">
        <MainUserProfile />
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- User Profile Card (Hidden on mobile, visible on desktop) -->
        <div class="hidden lg:block lg:col-span-4 order-2 lg:order-1">
          <MainUserProfile />
        </div>
        
        <!-- Game Accounts Section -->
        <div class="lg:col-span-8 order-1 lg:order-2">
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="p-6 border-b border-gray-100">
              <h2 class="text-2xl font-bold text-gray-900">Game Accounts</h2>
              <p class="text-gray-600 mt-1">Connect your gaming accounts to create a unified gaming profile.</p>
            </div>
            
            <!-- Connected Accounts Status -->
            <div class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-1">Connected Platforms</h3>
                  <div class="flex flex-wrap gap-2">
                    <span v-if="profile?.connectedAccounts?.steam" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.979 0C5.678 0 0.511 4.86 0.022 11.037l6.432 2.658c0.545-0.371 1.203-0.59 1.912-0.59 0.307 0 0.6 0.049 0.882 0.125l2.875-4.175V9.017c0-2.484 2.013-4.5 4.493-4.5 2.48 0 4.492 2.016 4.492 4.5s-2.013 4.5-4.492 4.5c-0.071 0-0.136-0.016-0.206-0.019l-4.1 2.934c0.008 0.061 0.019 0.123 0.019 0.185 0 1.933-1.557 3.5-3.479 3.5-1.688 0-3.088-1.205-3.416-2.803L0 16.068C1.549 20.704 6.295 24 11.979 24 18.626 24 24 18.617 24 11.999 24 5.382 18.626 0 11.979 0zM7.54 18.21l-1.473-0.61c0.262 0.543 0.714 0.999 1.314 1.25 1.297 0.539 2.793-0.076 3.332-1.375 0.263-0.63 0.264-1.319 0.005-1.949s-0.75-1.121-1.377-1.383c-0.624-0.26-1.29-0.249-1.878-0.03l1.523 0.63c0.956 0.4 1.409 1.5 1.009 2.455-0.397 0.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3-3.015-3-1.665 0-3.015 1.338-3.015 3s1.35 3 3.015 3c1.663 0 3.015-1.338 3.015-3zm-5.273-0.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/>
                      </svg>
                      Steam
                    </span>
                    <span v-if="profile?.connectedAccounts?.riot" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.534 21.77l-1.09-2.81 10.52.54-.451 4.5zM15.06 0L.307 6.969 2.59 17.471H5.6l-.52-7.512 3.541-1.5v9.012h3.121v-9.6l3.121-1.35-.54 10.95h3.121L19.334 0z"/>
                      </svg>
                      Riot Games
                    </span>
                    <span v-if="!profile?.connectedAccounts?.steam && !profile?.connectedAccounts?.riot" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                      </svg>
                      No accounts connected
                    </span>
                  </div>
                </div>
                <div v-if="profile?.connectedAccounts?.steam || profile?.connectedAccounts?.riot">
                  <NuxtLink 
                    to="/gaming-stats" 
                    class="inline-flex items-center px-4 py-2 bg-[var(--btn-primary)] text-white rounded-lg hover:bg-[var(--btn-primary-hover)] transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    View Gaming Stats
                  </NuxtLink>
                </div>
              </div>
            </div>
            
            <!-- Game Accounts Cards -->
            <div class="divide-y divide-gray-100">
              <!-- Steam Account -->
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xl font-semibold text-gray-900 flex items-center">
                    <svg class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.979 0C5.678 0 0.511 4.86 0.022 11.037l6.432 2.658c0.545-0.371 1.203-0.59 1.912-0.59 0.307 0 0.6 0.049 0.882 0.125l2.875-4.175V9.017c0-2.484 2.013-4.5 4.493-4.5 2.48 0 4.492 2.016 4.492 4.5s-2.013 4.5-4.492 4.5c-0.071 0-0.136-0.016-0.206-0.019l-4.1 2.934c0.008 0.061 0.019 0.123 0.019 0.185 0 1.933-1.557 3.5-3.479 3.5-1.688 0-3.088-1.205-3.416-2.803L0 16.068C1.549 20.704 6.295 24 11.979 24 18.626 24 24 18.617 24 11.999 24 5.382 18.626 0 11.979 0zM7.54 18.21l-1.473-0.61c0.262 0.543 0.714 0.999 1.314 1.25 1.297 0.539 2.793-0.076 3.332-1.375 0.263-0.63 0.264-1.319 0.005-1.949s-0.75-1.121-1.377-1.383c-0.624-0.26-1.29-0.249-1.878-0.03l1.523 0.63c0.956 0.4 1.409 1.5 1.009 2.455-0.397 0.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3-3.015-3-1.665 0-3.015 1.338-3.015 3s1.35 3 3.015 3c1.663 0 3.015-1.338 3.015-3zm-5.273-0.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/>
                    </svg>
                    Steam
                  </h3>
                  <span v-if="profile?.connectedAccounts?.steam" class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
                
                <div v-if="profile?.connectedAccounts?.steam" class="flex items-center mb-4 p-4 bg-gray-50 rounded-lg">
                  <img 
                    :src="profile.connectedAccounts.steam.avatarUrl" 
                    alt="Steam Avatar" 
                    class="w-12 h-12 rounded-full mr-4 border-2 border-gray-200"
                  />
                  <div>
                    <p class="font-medium text-gray-900">{{ profile.connectedAccounts.steam.personaName }}</p>
                    <p class="text-sm text-gray-600">Connected on {{ formatDate(profile.connectedAccounts.steam.connectedAt) }}</p>
                  </div>
                </div>
                
                <SteamLogin />
              </div>
              
              <!-- Riot Games Account -->
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xl font-semibold text-gray-900 flex items-center">
                    <svg class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.534 21.77l-1.09-2.81 10.52.54-.451 4.5zM15.06 0L.307 6.969 2.59 17.471H5.6l-.52-7.512 3.541-1.5v9.012h3.121v-9.6l3.121-1.35-.54 10.95h3.121L19.334 0z"/>
                    </svg>
                    Riot Games
                  </h3>
                  <span v-if="profile?.connectedAccounts?.riot" class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
                
                <RiotLogin :profile="profile" />
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
const { user, loading, error, signOut } = useFirebase();

const profile: Ref<any> = ref(null);
const games = ref<any[]>([]);
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

// Logout function
const logout = async () => {
  try {
    await signOut();
    navigateTo('/login');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

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
    const response = await $fetch<{ games?: any[] }>('/api/steam/games');
    games.value = response.games || [];
  } catch (error) {
    console.error('Error fetching games:', error);
  } finally {
    gamesLoading.value = false;
  }
};

// Handle refresh
const refreshPage = () => {
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

// Format playtime
const formatPlaytime = (minutes: number) => {
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
const formatDate = (timestamp: any) => {
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

// Initialize the page
onMounted(async () => {
  console.log('Dashboard page mounted');
  
  // Check if we're returning from a Steam connection
  if (route.query.platform === 'steam' && route.query.status === 'connected') {
    console.log('Detected successful Steam connection in URL');
    
    // Wait a moment for Firebase auth to initialize
    if (user.value) {
      console.log('User is authenticated, fetching fresh profile data');
      await fetchProfile();
    }
  }
  
  // If user is already authenticated, fetch profile
  if (!loading.value && user.value) {
    console.log('User already authenticated, fetching profile');
    await fetchProfile();
  }
});
</script>

<style scoped>
/* Add any additional custom styles here */
</style> 