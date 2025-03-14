<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
    
      <div v-if="loading" class="flex justify-center items-center py-8">
        <svg class="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="ml-3 text-lg text-gray-600">Checking authentication...</span>
      </div>
      
      <div v-else class="space-y-6">
        <!-- Firebase Authentication -->
        <div>
          <FirebaseLogin />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFirebase } from '~/composables/useFirebase';
import { onMounted, watch } from 'vue';

const { user, loading } = useFirebase();

// Redirect to dashboard if already logged in
onMounted(() => {
  // Watch for changes in user and loading state
  watch([user, loading], ([newUser, newLoading]) => {
    if (newUser && !newLoading) {
      // Add a small delay to ensure everything is loaded
      setTimeout(() => {
        navigateTo('/dashboard');
      }, 500);
    }
  });
});
</script> 