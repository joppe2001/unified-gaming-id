<template>
  <div>
    <div v-if="loading" class="flex justify-center py-4">
      <div class="loading-spinner-small">
        <div class="spinner-inner-small"></div>
      </div>
    </div>
    
    <div v-else-if="error" class="p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg mb-4">
      <p class="font-medium mb-1">Connection Error</p>
      <p class="text-sm">{{ error }}</p>
    </div>
    
    <div v-else>
      <div v-if="isSteamConnected" class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <button 
          @click="disconnectSteam" 
          class="py-2 px-4 bg-red-900/50 hover:bg-red-800 text-white rounded-lg transition flex items-center justify-center relative overflow-hidden group"
          :disabled="disconnectLoading"
        >
          <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 group-hover:-translate-x-full"></span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          <span v-if="disconnectLoading">Disconnecting...</span>
          <span v-else>Disconnect Steam</span>
        </button>
        
        <button 
          @click="refreshSteamData" 
          class="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center justify-center relative overflow-hidden group"
          :disabled="refreshLoading"
        >
          <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 group-hover:-translate-x-full"></span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
          <span v-if="refreshLoading">Refreshing...</span>
          <span v-else>Refresh Data</span>
        </button>
      </div>
      
      <div v-else>
        <p class="text-gray-300 mb-4">Connect your Steam account to track your games, achievements, and stats.</p>
        <a 
          :href="steamAuthUrl" 
          class="inline-flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition relative overflow-hidden group"
        >
          <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-20 group-hover:-translate-x-full"></span>
          <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.979 0C5.678 0 0.511 4.86 0.022 11.037l6.432 2.658c0.545-0.371 1.203-0.59 1.912-0.59 0.307 0 0.6 0.049 0.882 0.125l2.875-4.175V9.017c0-2.484 2.013-4.5 4.493-4.5 2.48 0 4.492 2.016 4.492 4.5s-2.013 4.5-4.492 4.5c-0.071 0-0.136-0.016-0.206-0.019l-4.1 2.934c0.008 0.061 0.019 0.123 0.019 0.185 0 1.933-1.557 3.5-3.479 3.5-1.688 0-3.088-1.205-3.416-2.803L0 16.068C1.549 20.704 6.295 24 11.979 24 18.626 24 24 18.617 24 11.999 24 5.382 18.626 0 11.979 0zM7.54 18.21l-1.473-0.61c0.262 0.543 0.714 0.999 1.314 1.25 1.297 0.539 2.793-0.076 3.332-1.375 0.263-0.63 0.264-1.319 0.005-1.949s-0.75-1.121-1.377-1.383c-0.624-0.26-1.29-0.249-1.878-0.03l1.523 0.63c0.956 0.4 1.409 1.5 1.009 2.455-0.397 0.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3-3.015-3-1.665 0-3.015 1.338-3.015 3s1.35 3 3.015 3c1.663 0 3.015-1.338 3.015-3zm-5.273-0.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/>
          </svg>
          Connect with Steam
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, inject } from 'vue';
import { useFirebase } from '~/composables/useFirebase';
import { useCookie, useRoute } from '#app';

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

const { user, signInWithCustomToken } = useFirebase();
const route = useRoute();

// Inject the profile from the parent component
const injectedProfile = inject<Ref<UserProfile | null>>('profile', ref(null));

const loading = ref(false);
const error = ref<string | null>(null);
const disconnectLoading = ref(false);
const refreshLoading = ref(false);

// Computed property to check if Steam is connected
const isSteamConnected = computed(() => {
  console.log('SteamLogin - Checking if Steam is connected:', injectedProfile.value?.connectedAccounts?.steam);
  return !!injectedProfile.value?.connectedAccounts?.steam;
});

// Watch for user changes to check Steam connection
watch(user, async (newUser) => {
  if (newUser) {
    // If we have a user but no profile data, fetch it
    if (!injectedProfile.value) {
      await checkSteamConnection();
    }
  }
});

// Check if user is already connected to Steam
const checkSteamConnection = async () => {
  if (!user.value) return;
  
  try {
    loading.value = true;
    
    console.log('Checking Steam connection status for user:', user.value.uid);
    const response = await $fetch<UserProfile>('/api/user/profile');
    
    // Check if the response is an error
    const errorResponse = response as any;
    if (errorResponse && 
        typeof errorResponse === 'object' && 
        errorResponse.statusCode && 
        errorResponse.body && 
        errorResponse.body.error) {
      console.error('Error response from profile API:', errorResponse);
      throw new Error(errorResponse.body.error);
    }
    
    // Log the user document to help with debugging
    console.log('User document:', JSON.stringify(response, null, 2));
    
    // Update the injected profile if it's not already set
    if (!injectedProfile.value && response) {
      injectedProfile.value = response;
    }
    
    return !!response?.connectedAccounts?.steam;
  } catch (err: any) {
    console.error('Error fetching user profile:', err);
    
    // Check if the error is related to Firestore not being enabled
    if (err.message?.includes('PERMISSION_DENIED') && err.message?.includes('Cloud Firestore API has not been used')) {
      error.value = 'Firestore API is not enabled. Please enable it in the Google Cloud Console.';
    } else {
      error.value = 'Failed to check Steam connection status: ' + (err.message || 'Unknown error');
    }
    return false;
  } finally {
    loading.value = false;
  }
};

// Implement a direct approach to disconnect Steam
const disconnectSteam = async () => {
  if (!isSteamConnected.value || !user.value) return;
  
  disconnectLoading.value = true;
  error.value = null;
  
  try {
    // Call our API endpoint to disconnect Steam
    type DisconnectResponse = {
      success: boolean;
      error?: string;
    };
    
    const response = await $fetch<DisconnectResponse>('/api/disconnect-steam', {
      method: 'POST'
    });
    
    if (response.success) {
      // Update the injected profile to reflect the disconnection
      if (injectedProfile.value?.connectedAccounts) {
        injectedProfile.value.connectedAccounts.steam = undefined;
      }
    } else {
      error.value = response.error || 'Failed to disconnect Steam account';
    }
  } catch (err: any) {
    console.error('Error disconnecting Steam account:', err);
    error.value = 'Failed to disconnect Steam account';
  } finally {
    disconnectLoading.value = false;
  }
};

const refreshSteamData = async () => {
  if (!isSteamConnected.value || !user.value) return;
  
  refreshLoading.value = true;
  
  try {
    // Refresh the profile data
    const response = await $fetch<UserProfile>('/api/user/profile');
    
    // Check if the response is an error
    const errorResponse = response as any;
    if (errorResponse && 
        typeof errorResponse === 'object' && 
        errorResponse.statusCode && 
        errorResponse.body && 
        errorResponse.body.error) {
      console.error('Error response from profile API:', errorResponse);
      throw new Error(errorResponse.body.error);
    }
    
    // Update the injected profile
    if (response) {
      injectedProfile.value = response;
      console.log('Updated profile data:', response);
    }
    
    // You could also refresh games data here if needed
  } catch (err: any) {
    console.error('Error refreshing Steam data:', err);
    error.value = 'Failed to refresh Steam data: ' + (err.message || 'Unknown error');
  } finally {
    refreshLoading.value = false;
  }
};

const steamAuthUrl = '/api/connect-steam';

onMounted(async () => {
  console.log('SteamLogin component mounted');
  
  // Check for error or success messages in URL first
  if (route.query.platform === 'steam' && route.query.status === 'connected') {
    console.log('Detected successful Steam connection in URL');
    
    // Force a refresh of the user profile to ensure we have the latest data
    if (user.value) {
      console.log('Refreshing user profile after Steam connection');
      await checkSteamConnection();
    }
  } else if (route.query.error === 'steam_auth_failed') {
    error.value = 'Failed to connect to Steam. Please try again.';
  } else if (route.query.error === 'steam_callback_error') {
    error.value = 'Error processing Steam login. Please try again.';
  } else if (route.query.error === 'firestore_not_enabled') {
    error.value = 'Firestore API is not enabled. Please enable it in the Google Cloud Console: https://console.cloud.google.com';
  }
  
  // If we don't have profile data yet, check Steam connection
  if (!injectedProfile.value && user.value) {
    await checkSteamConnection();
  }
  
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
    console.log('Found custom token cookie, signing in with custom token');
    try {
      loading.value = true;
      await signInWithCustomToken(customTokenCookie.value);
      
      // Clear the cookie after use with the same settings
      customTokenCookie.value = null;
      
      // Force a refresh of the connection status
      await checkSteamConnection();
    } catch (err) {
      console.error('Error signing in with custom token:', err);
      error.value = 'Failed to authenticate with Steam';
    } finally {
      loading.value = false;
    }
  }
});
</script>

<style scoped>
.loading-spinner-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: conic-gradient(transparent 0%, rgba(59, 130, 246, 0.8));
  -webkit-mask: radial-gradient(circle at center, transparent 55%, white 55%);
  mask: radial-gradient(circle at center, transparent 55%, white 55%);
  animation: spin 1.5s linear infinite;
}

.spinner-inner-small {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #60a5fa;
  top: calc(50% - 3px);
  left: calc(50% - 3px);
  box-shadow: 0 0 10px 2px rgba(96, 165, 250, 0.6);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 