<template>
  <div class="min-h-screen bg-gray-900 bg-opacity-95 p-4 text-white">
    <div v-if="loading" class="flex flex-col items-center justify-center py-10">
      <div class="loading-spinner mb-4">
        <div class="spinner-inner"></div>
      </div>
      <p class="text-xl text-blue-400">Loading profile...</p>
    </div>
    
    <div v-else-if="!user" class="text-center py-10">
      <p class="text-xl mb-4 text-gray-300">You need to be logged in to access this page</p>
      <NuxtLink to="/login" class="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition relative overflow-hidden group">
        <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 group-hover:-translate-x-full"></span>
        Go to Login
      </NuxtLink>
    </div>
    
    <div v-else class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold gaming-text">User Profile</h1>
        <NuxtLink to="/dashboard" class="py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition border border-gray-700 relative overflow-hidden group">
          <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 group-hover:-translate-x-full"></span>
          Back to Dashboard
        </NuxtLink>
      </div>
      
      <!-- Profile Card -->
      <div class="bg-gray-800 bg-opacity-70 rounded-xl shadow-glow border border-gray-700 overflow-hidden backdrop-blur-sm mb-6">
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
          <div class="absolute bottom-0 left-8 transform translate-y-1/2 flex items-end">
            <div class="relative">
              <img 
                :src="user.photoURL || 'https://api.dicebear.com/6.x/bottts/svg?seed=' + (user.displayName || user.email || 'default')" 
                alt="Profile Avatar" 
                class="w-24 h-24 rounded-full border-4 border-gray-800 object-cover shadow-glow"
                @error="handleImageError"
                ref="profileImage"
              />
              <div class="absolute inset-0 rounded-full border-2 border-blue-400 opacity-50 animate-pulse"></div>
            </div>
            <div class="ml-4 mb-4">
              <h2 class="text-2xl font-bold text-white">{{ user.displayName || 'Gamer' }}</h2>
              <p class="text-gray-400 text-sm">{{ user.email }}</p>
            </div>
          </div>
        </div>
        
        <div class="pt-16 pb-6 px-6">
          <!-- Account Settings -->
          <div class="mt-6 pt-4">
            <h3 class="text-xl font-semibold mb-4 text-blue-400">Account Settings</h3>
            
            <div class="space-y-4">
              <div class="flex flex-col md:flex-row md:items-center gap-4">
                <button 
                  class="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center justify-center relative overflow-hidden group"
                >
                  <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 group-hover:-translate-x-full"></span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Display Name
                </button>
                
                <button 
                  @click="logout" 
                  class="py-2 px-4 bg-red-900/50 hover:bg-red-800 text-white rounded-lg transition flex items-center justify-center relative overflow-hidden group"
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
        </div>
      </div>
      
      <!-- Connected Accounts Section -->
      <div class="bg-gray-800 bg-opacity-70 rounded-xl shadow-glow border border-gray-700 overflow-hidden backdrop-blur-sm">
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-6 text-blue-400">Connected Gaming Accounts</h3>
          
          <!-- Steam Account -->
          <div v-if="profile?.connectedAccounts?.steam" class="flex flex-col md:flex-row items-start md:items-center p-4 bg-gray-900/50 rounded-lg mb-4 border border-gray-700">
            <img 
              :src="profile.connectedAccounts.steam.avatarUrl" 
              alt="Steam Avatar" 
              class="w-16 h-16 rounded-full mr-4 border-2 border-blue-500/30"
            />
            <div class="flex-1 mt-4 md:mt-0">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <p class="font-medium text-lg text-white">{{ profile.connectedAccounts.steam.personaName }}</p>
                  <p class="text-sm text-gray-400">Connected on {{ formatDate(profile.connectedAccounts.steam.connectedAt) }}</p>
                  <p class="text-xs text-gray-500 mt-1">Steam ID: {{ profile.connectedAccounts.steam.steamId }}</p>
                </div>
                <div class="flex space-x-2 mt-4 md:mt-0">
                  <a 
                    :href="profile.connectedAccounts.steam.profileUrl" 
                    target="_blank" 
                    class="px-3 py-1 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition text-sm flex items-center"
                  >
                    <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Profile
                  </a>
                  <NuxtLink 
                    to="/gaming-stats" 
                    class="px-3 py-1 bg-blue-600/70 text-white rounded-md hover:bg-blue-700 transition text-sm flex items-center"
                  >
                    <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 19V13M9 13V5M9 13H15M15 13V5M15 13V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    View Stats
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
          
          <!-- No Connected Accounts -->
          <div v-if="!hasConnectedAccounts" class="p-6 bg-gray-900/50 rounded-lg text-center border border-gray-700">
            <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-400 mb-4">No gaming accounts connected yet.</p>
            <NuxtLink 
              to="/dashboard" 
              class="mt-2 inline-block px-4 py-2 bg-blue-600/70 text-white rounded-md hover:bg-blue-700 transition relative overflow-hidden group"
            >
              <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 group-hover:-translate-x-full"></span>
              Connect Gaming Accounts
            </NuxtLink>
          </div>
          
          <!-- Connect More Accounts -->
          <div v-if="hasConnectedAccounts" class="mt-6 text-center">
            <NuxtLink 
              to="/dashboard" 
              class="inline-block px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition relative overflow-hidden group"
            >
              <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 group-hover:-translate-x-full"></span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Connect More Accounts
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useFirebase } from '~/composables/useFirebase';

const { user, loading } = useFirebase();
const profile = ref<any>(null);
const profileImage = ref<HTMLImageElement | null>(null);

// Check if user has any connected accounts
const hasConnectedAccounts = computed(() => {
  if (!profile.value?.connectedAccounts) return false;
  return Object.keys(profile.value.connectedAccounts).length > 0;
});

// Handle image loading errors
const handleImageError = (event: Event) => {
  // Fall back to initials if image fails to load
  if (event.target) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
};

// Logout function
const logout = async () => {
  try {
    // Access signOut from the useFirebase composable
    const { signOut } = useFirebase();
    await signOut();
    navigateTo('/login');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

// Fetch user profile
const fetchProfile = async () => {
  if (!user.value) return;
  
  try {
    const response = await $fetch('/api/user/profile');
    profile.value = response;
  } catch (error) {
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
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    return 'Invalid date';
  }
};

onMounted(async () => {
  if (user.value) {
    await fetchProfile();
  }
});
</script>

<style scoped>
.gaming-text {
  background: linear-gradient(90deg, #60a5fa, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.shadow-glow {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.bg-grid-gaming {
  background-image: 
    linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
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

.loading-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: conic-gradient(transparent 0%, rgba(59, 130, 246, 0.8));
  -webkit-mask: radial-gradient(circle at center, transparent 55%, white 55%);
  mask: radial-gradient(circle at center, transparent 55%, white 55%);
  animation: spin 1.5s linear infinite;
}

.spinner-inner {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #60a5fa;
  top: calc(50% - 4px);
  left: calc(50% - 4px);
  box-shadow: 0 0 10px 2px rgba(96, 165, 250, 0.6);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 