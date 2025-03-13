<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-4">Your Profile</h2>
    
    <div v-if="user" class="flex flex-col items-center">
      <div class="mb-4 relative">
        <img 
          v-if="user.photoURL" 
          :src="user.photoURL" 
          alt="Profile" 
          class="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
          @error="handleImageError"
          ref="profileImage"
        />
        <div 
          v-else 
          class="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-3xl font-bold border-2 border-blue-500"
        >
          {{ userInitials }}
        </div>
      </div>
      
      <h3 class="text-xl font-semibold">{{ user.displayName || 'User' }}</h3>
      <p class="text-gray-600 mb-4">{{ user.email || 'No email provided' }}</p>
      
      <button 
        @click="signOut" 
        class="mt-2 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
      >
        Sign Out
      </button>
    </div>
    
    <div v-else class="text-center py-4">
      <p class="text-gray-500">Loading profile...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useFirebase } from '~/composables/useFirebase';
import { useRouter } from 'vue-router';

const router = useRouter();
const { user, signOut: firebaseSignOut } = useFirebase();
const profileImage = ref(null);

// Handle image loading errors
const handleImageError = (event) => {
  // Fall back to initials if image fails to load
  event.target.style.display = 'none';
  // Force re-render of the component to show initials
  user.value = { ...user.value, photoURL: null };
};

// Get user initials for avatar fallback
const userInitials = computed(() => {
  if (!user.value) return '?';
  
  if (user.value.displayName) {
    return user.value.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  if (user.value.email) {
    return user.value.email[0].toUpperCase();
  }
  
  return '?';
});

// Sign out and redirect to login
const signOut = async () => {
  try {
    await firebaseSignOut();
    router.push('/login');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};
</script> 