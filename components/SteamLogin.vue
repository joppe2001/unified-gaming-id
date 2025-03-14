<template>
  <div class="steam-login">
    <div v-if="!connected || loading" class="w-full">
      <button 
        @click="connectSteam" 
        class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors w-full justify-center"
        :disabled="loading || !user"
        :class="{ 'bg-green-700 hover:bg-green-800': connected }"
      >
        <img src="/images/steam-logo.svg" alt="Steam" class="w-6 h-6" />
        <span v-if="!connected && !loading">Connect with Steam</span>
        <span v-else-if="connected && !loading">Connected to Steam</span>
        <span v-else>Connecting...</span>
        <span v-if="loading" class="ml-2">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      </button>
    </div>
    
    <div v-else class="flex items-center justify-between bg-green-700 text-white font-medium py-2 px-4 rounded w-full">
      <div class="flex items-center gap-2">
        <img src="/images/steam-logo.svg" alt="Steam" class="w-6 h-6" />
        <span>Connected to Steam</span>
      </div>
      <button 
        @click="disconnectSteam" 
        class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm transition-colors"
      >
        Logout
      </button>
    </div>
    
    <div v-if="error" class="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
      {{ error }}
    </div>
    
    <div v-if="!user" class="mt-2 text-sm text-gray-500 text-center">
      Sign in with your account first to connect Steam
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useFirebase } from '~/composables/useFirebase';
import { useCookie, useRoute } from '#app';

const { user, signInWithCustomToken } = useFirebase();
const route = useRoute();

const loading = ref(false);
const connected = ref(false);
const error = ref<string | null>(null);

// Check if user is already connected to Steam
const checkSteamConnection = async () => {
  if (!user.value) return;
  
  try {
    const userDoc = await $fetch('/api/user/profile');
    connected.value = !!userDoc?.connectedAccounts?.steam;
  } catch (err: any) {
    console.error('Error fetching user profile:', err);
    
    // Check if the error is related to Firestore not being enabled
    if (err.message?.includes('PERMISSION_DENIED') && err.message?.includes('Cloud Firestore API has not been used')) {
      error.value = 'Firestore API is not enabled. Please enable it in the Google Cloud Console.';
    } else {
      error.value = 'Failed to check Steam connection status';
    }
  }
};

// Watch for user changes to check Steam connection
watch(user, async (newUser) => {
  if (newUser) {
    await checkSteamConnection();
  } else {
    connected.value = false;
  }
});

onMounted(async () => {
  // Check for Steam connection status
  await checkSteamConnection();
  
  // Get the base URL for cookie settings
  const config = useRuntimeConfig();
  const baseUrl = config.public.baseUrl;
  
  // Extract domain from baseUrl for cookie settings
  const urlObj = new URL(baseUrl);
  const domain = urlObj.hostname;
  
  // Check for custom token in cookies with proper settings
  const customTokenCookie = useCookie('firebaseCustomToken', {
    path: '/',
    // Only set domain for production (not localhost)
    ...(domain !== 'localhost' && { domain })
  });
  
  if (customTokenCookie.value) {
    try {
      loading.value = true;
      await signInWithCustomToken(customTokenCookie.value);
      connected.value = true;
      // Clear the cookie after use with the same settings
      customTokenCookie.value = null;
    } catch (err) {
      console.error('Error signing in with custom token:', err);
      error.value = 'Failed to authenticate with Steam';
    } finally {
      loading.value = false;
    }
  }
  
  // Check for error or success messages in URL
  if (route.query.error === 'steam_auth_failed') {
    error.value = 'Failed to connect to Steam. Please try again.';
  } else if (route.query.error === 'steam_callback_error') {
    error.value = 'Error processing Steam login. Please try again.';
  } else if (route.query.error === 'firestore_not_enabled') {
    error.value = 'Firestore API is not enabled. Please enable it in the Google Cloud Console: https://console.cloud.google.com';
  } else if (route.query.platform === 'steam' && route.query.status === 'connected') {
    connected.value = true;
  }
});

const connectSteam = async () => {
  if (connected.value || !user.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // Redirect to the Steam connect endpoint
    window.location.href = '/api/connect-steam';
  } catch (err) {
    console.error('Error connecting to Steam:', err);
    error.value = 'Failed to connect to Steam';
    loading.value = false;
  }
};

// Implement a direct approach to disconnect Steam
const disconnectSteam = async () => {
  if (!connected.value || !user.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // Call our API endpoint to disconnect Steam
    const response = await $fetch('/api/disconnect-steam', {
      method: 'POST'
    });
    
    if (response.success) {
      connected.value = false;
    } else {
      error.value = response.error || 'Failed to disconnect Steam account';
    }
  } catch (err) {
    console.error('Error disconnecting Steam account:', err);
    error.value = 'Failed to disconnect Steam account';
  } finally {
    loading.value = false;
  }
};
</script> 