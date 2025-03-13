<template>
  <div class="riot-login">
    <div v-if="profile?.connectedAccounts?.riot" class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mr-3">
          <span class="text-white font-bold">{{ profile.connectedAccounts.riot.gameName?.charAt(0) || 'R' }}</span>
        </div>
        <div>
          <p class="font-medium">{{ profile.connectedAccounts.riot.gameName }}#{{ profile.connectedAccounts.riot.tagLine }}</p>
          <p class="text-sm text-gray-600">Connected on {{ formatDate(profile.connectedAccounts.riot.connectedAt) }}</p>
        </div>
      </div>
      <button 
        @click="disconnectRiotAccount" 
        class="text-red-600 hover:text-red-800 text-sm font-medium"
        :disabled="loading"
      >
        Disconnect
      </button>
    </div>
    
    <button 
      v-if="!profile?.connectedAccounts?.riot"
      @click="connectRiotAccount" 
      class="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
      :disabled="loading"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M12.534 21.77l-1.09-2.81 10.52.54-.451 4.5zM15.06 0L.307 6.969 2.59 17.471H5.6l-.52-7.512 3.541-1.5v9.012h3.121v-9.6l3.121-1.35-.54 10.95h3.121L19.334 0z"/>
      </svg>
      <span>{{ profile?.connectedAccounts?.riot ? 'Reconnect' : 'Connect' }} Riot Account</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useFirebase } from '~/composables/useFirebase';

const { signInWithRiot } = useFirebase();
const loading = ref(false);
const error = ref('');

// Get profile from parent component
const props = defineProps({
  profile: {
    type: Object,
    default: () => ({})
  }
});

// Format date (reusing the function from dashboard.vue)
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

// Connect Riot account
const connectRiotAccount = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await signInWithRiot();
    // The page will redirect to Riot's OAuth page
  } catch (err: any) {
    error.value = err.message || 'Failed to connect Riot account';
    console.error('Error connecting Riot account:', err);
    loading.value = false;
  }
};

// Disconnect Riot account
const disconnectRiotAccount = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await $fetch('/api/riot/disconnect', { method: 'POST' });
    // Refresh the profile
    window.location.reload();
  } catch (err: any) {
    error.value = err.message || 'Failed to disconnect Riot account';
    console.error('Error disconnecting Riot account:', err);
    loading.value = false;
  }
};
</script> 