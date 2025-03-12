<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-6">Connect Your Gaming Accounts</h2>
    
    <div class="space-y-4">
      <div 
        v-for="platform in platforms" 
        :key="platform.id" 
        class="flex items-center justify-between p-4 border rounded-lg"
        :class="platform.isConnected() ? 'border-green-500 bg-green-50' : 'border-gray-300'"
      >
        <div class="flex items-center">
          <div 
            class="w-10 h-10 flex items-center justify-center rounded-full mr-3" 
            :style="`background-color: ${platform.color}`"
          >
            <img :src="platform.icon" :alt="`${platform.name} logo`" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-semibold">{{ platform.name }}</h3>
            <p v-if="platform.isConnected()" class="text-sm text-green-600">Connected</p>
            <p v-else class="text-sm text-gray-500">Not connected</p>
          </div>
        </div>
        
        <button 
          v-if="platform.isConnected()" 
          @click="disconnectPlatform(platform)" 
          class="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
          :disabled="loading"
        >
          Disconnect
        </button>
        
        <button 
          v-else 
          @click="connectPlatform(platform)" 
          class="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
          :disabled="loading"
        >
          Connect
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GamePlatform, usePlatforms } from '~/composables/usePlatform';
import { useSteamPlatform } from '~/composables/useSteamPlatform';

// Initialize all platform integrations
const { steamPlatform } = useSteamPlatform();

const { platforms } = usePlatforms();
const loading = ref(false);

// Connect to a platform
const connectPlatform = async (platform: GamePlatform) => {
  loading.value = true;
  try {
    await platform.connect();
  } catch (error) {
    console.error(`Error connecting to ${platform.name}:`, error);
  } finally {
    loading.value = false;
  }
};

// Disconnect from a platform
const disconnectPlatform = async (platform: GamePlatform) => {
  loading.value = true;
  try {
    await platform.disconnect();
  } catch (error) {
    console.error(`Error disconnecting from ${platform.name}:`, error);
  } finally {
    loading.value = false;
  }
};
</script> 