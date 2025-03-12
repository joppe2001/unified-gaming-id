<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
      <p class="text-xl">Loading profile...</p>
    </div>
    
    <div v-else-if="!user" class="text-center py-10">
      <p class="text-xl mb-4">You need to be logged in to access this page</p>
      <NuxtLink to="/login" class="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        Go to Login
      </NuxtLink>
    </div>
    
    <div v-else class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">User Profile</h1>
        <NuxtLink to="/dashboard" class="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          Back to Dashboard
        </NuxtLink>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center mb-6">
          <div class="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-4">
            <img 
              v-if="user.photoURL" 
              :src="user.photoURL" 
              alt="Profile" 
              class="w-full h-full object-cover"
              @error="handleImageError"
              ref="profileImage"
            />
            <span v-else class="text-3xl text-gray-600">{{ user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?' }}</span>
          </div>
          <div>
            <h2 class="text-2xl font-bold">{{ user.displayName || 'User' }}</h2>
            <p class="text-gray-600">{{ user.email }}</p>
          </div>
        </div>
        
        <div class="border-t pt-4">
          <h3 class="text-xl font-semibold mb-4">Connected Accounts</h3>
          
          <div v-if="profile?.connectedAccounts?.steam" class="flex items-center p-4 bg-gray-50 rounded-lg mb-4">
            <img 
              :src="profile.connectedAccounts.steam.avatarUrl" 
              alt="Steam Avatar" 
              class="w-12 h-12 rounded-full mr-4"
            />
            <div class="flex-1">
              <p class="font-medium">{{ profile.connectedAccounts.steam.personaName }}</p>
              <p class="text-sm text-gray-600">Connected on {{ formatDate(profile.connectedAccounts.steam.connectedAt) }}</p>
            </div>
            <NuxtLink 
              to="/gaming-stats" 
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              View Stats
            </NuxtLink>
          </div>
          
          <div v-else class="p-4 bg-gray-50 rounded-lg text-center">
            <p class="text-gray-600">No gaming accounts connected yet.</p>
            <NuxtLink 
              to="/dashboard" 
              class="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Connect Accounts
            </NuxtLink>
          </div>
        </div>
        
        <div class="border-t mt-6 pt-4">
          <h3 class="text-xl font-semibold mb-4">Account Settings</h3>
          
          <button 
            @click="logout" 
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFirebase } from '~/composables/useFirebase';

const { user, loading, logout } = useFirebase();
const profile = ref(null);
const profileImage = ref(null);

// Log user data for debugging
onMounted(() => {
  if (user.value) {
    console.log('User data in Profile page:', {
      displayName: user.value.displayName,
      email: user.value.email,
      photoURL: user.value.photoURL
    });
  }
});

// Handle image loading errors
const handleImageError = (event) => {
  console.error('Error loading profile image:', user.value?.photoURL);
  // Fall back to initials if image fails to load
  event.target.style.display = 'none';
};

// Fetch user profile
const fetchProfile = async () => {
  if (!user.value) return;
  
  try {
    profile.value = await $fetch('/api/user/profile');
    console.log('Fetched profile data:', profile.value);
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

onMounted(async () => {
  if (user.value) {
    await fetchProfile();
  }
});
</script> 