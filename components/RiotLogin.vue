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
      <div v-if="profile?.connectedAccounts?.riot" class="flex items-center mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <div class="w-12 h-12 rounded-full mr-4 bg-red-900/50 border-2 border-gray-700 flex items-center justify-center shadow-glow">
          <svg class="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.534 21.77l-1.09-2.81 10.52.54-.451 4.5zM15.06 0L.307 6.969 2.59 17.471H5.6l-.52-7.512 3.541-1.5v9.012h3.121v-9.6l3.121-1.35-.54 10.95h3.121L19.334 0z"/>
          </svg>
        </div>
        <div>
          <p class="font-medium text-red-300">{{ profile.connectedAccounts.riot.gameName }}#{{ profile.connectedAccounts.riot.tagLine }}</p>
          <p class="text-sm text-gray-400">Connected on {{ formatDate(profile.connectedAccounts.riot.connectedAt) }}</p>
        </div>
      </div>
      
      <div v-if="profile?.connectedAccounts?.riot" class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <button 
          @click="disconnectRiot" 
          class="py-2 px-4 bg-red-900/50 hover:bg-red-800 text-white rounded-lg transition flex items-center justify-center relative overflow-hidden group"
          :disabled="disconnectLoading"
        >
          <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 group-hover:-translate-x-full"></span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          <span v-if="disconnectLoading">Disconnecting...</span>
          <span v-else>Disconnect Riot</span>
        </button>
        
        <button 
          @click="refreshRiotData" 
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
        <p class="text-gray-300 mb-4">Connect your Riot Games account to track your Valorant, League of Legends, and other Riot games stats.</p>
        <a 
          :href="riotAuthUrl" 
          class="inline-flex items-center py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-lg transition relative overflow-hidden group"
        >
          <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-20 group-hover:-translate-x-full"></span>
          <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.534 21.77l-1.09-2.81 10.52.54-.451 4.5zM15.06 0L.307 6.969 2.59 17.471H5.6l-.52-7.512 3.541-1.5v9.012h3.121v-9.6l3.121-1.35-.54 10.95h3.121L19.334 0z"/>
          </svg>
          Connect with Riot Games
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-spinner-small {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: conic-gradient(transparent 0%, rgba(239, 68, 68, 0.8));
  -webkit-mask: radial-gradient(circle at center, transparent 55%, white 55%);
  mask: radial-gradient(circle at center, transparent 55%, white 55%);
  animation: spin 1.5s linear infinite;
}

.spinner-inner-small {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #f87171;
  top: calc(50% - 3px);
  left: calc(50% - 3px);
  box-shadow: 0 0 10px 2px rgba(248, 113, 113, 0.6);
}

.shadow-glow {
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  profile: {
    type: Object,
    default: () => ({})
  }
});

const loading = ref(false);
const error = ref('');
const disconnectLoading = ref(false);
const refreshLoading = ref(false);

// Riot Auth URL
const riotAuthUrl = computed(() => {
  return '/api/riot/auth';
});

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

// Disconnect Riot account
const disconnectRiot = async () => {
  if (!confirm('Are you sure you want to disconnect your Riot Games account?')) {
    return;
  }
  
  disconnectLoading.value = true;
  error.value = '';
  
  try {
    await $fetch('/api/riot/disconnect', { method: 'POST' });
    // Refresh the page to update the UI
    window.location.reload();
  } catch (err: any) {
    error.value = err.message || 'Failed to disconnect Riot account';
    console.error('Error disconnecting Riot account:', err);
  } finally {
    disconnectLoading.value = false;
  }
};

// Refresh Riot data
const refreshRiotData = async () => {
  refreshLoading.value = true;
  error.value = '';
  
  try {
    await $fetch('/api/riot/refresh', { method: 'POST' });
    // Refresh the page to update the UI
    window.location.reload();
  } catch (err: any) {
    error.value = err.message || 'Failed to refresh Riot data';
    console.error('Error refreshing Riot data:', err);
  } finally {
    refreshLoading.value = false;
  }
};

// Initialize component
onMounted(() => {
  // Check if we're returning from a Riot connection
  if (window.location.search.includes('platform=riot') && window.location.search.includes('status=connected')) {
    console.log('Detected successful Riot connection in URL');
    // Refresh the page to clear the URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});
</script> 