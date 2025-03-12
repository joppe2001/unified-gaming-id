<template>
  <div v-if="user" class="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
    <div class="flex items-center mb-4">
      <img 
        v-if="user.photoURL" 
        :src="user.photoURL" 
        alt="Profile" 
        class="w-16 h-16 rounded-full mr-4"
      />
      <div v-else class="w-16 h-16 rounded-full bg-gray-300 mr-4 flex items-center justify-center">
        <span class="text-2xl text-gray-600">{{ user.displayName?.charAt(0) || user.email?.charAt(0) || '?' }}</span>
      </div>
      
      <div>
        <h2 class="text-xl font-bold">{{ user.displayName || 'User' }}</h2>
        <p class="text-gray-600">{{ user.email }}</p>
      </div>
    </div>
    
    <div v-if="error" class="w-full p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>
    
    <div class="w-full mt-4">
      <h3 class="text-lg font-semibold mb-2">Connected Accounts</h3>
      <p class="text-gray-600 italic">No gaming accounts connected yet.</p>
      
      <button 
        @click="signOut" 
        :disabled="loading"
        class="cursor-pointer mt-6 w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading" class="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2 inline-block"></span>
        {{ loading ? 'Signing out...' : 'Sign Out' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, signOut, loading, error } = useAuth();
</script> 