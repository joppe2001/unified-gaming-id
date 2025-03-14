<template>
  <!-- Header with responsive navigation -->
  <header class="bg-gray-900 shadow-lg sticky top-0 z-60 border-b border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 md:h-20">
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <h1 class="text-xl md:text-2xl font-bold text-white flex items-center">
              <svg class="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 text-blue-400 filter drop-shadow-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span class="truncate gaming-text">Unified Gaming ID</span>
            </h1>
          </div>
        </div>
        
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-6">
          <NuxtLink 
            to="/dashboard" 
            class="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            active-class="text-blue-400 bg-gray-800 border-b-2 border-blue-500"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink 
            to="/gaming-stats" 
            class="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            active-class="text-blue-400 bg-gray-800 border-b-2 border-blue-500"
          >
            Stats
          </NuxtLink>
          <NuxtLink 
            to="/profile" 
            class="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
            active-class="text-blue-400 bg-gray-800"
          >
            <span class="sr-only">Profile</span>
            <svg class="h-6 w-6 filter drop-shadow-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </NuxtLink>
        </nav>
        
        <!-- Mobile menu button -->
        <div class="flex items-center md:hidden">
          <NuxtLink 
            to="/profile" 
            class="p-2 mr-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
          >
            <span class="sr-only">Profile</span>
            <svg class="h-6 w-6 filter drop-shadow-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </NuxtLink>
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen" 
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span class="sr-only">Open main menu</span>
            <!-- Icon when menu is closed -->
            <svg 
              v-if="!mobileMenuOpen" 
              class="block h-6 w-6" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <!-- Icon when menu is open -->
            <svg 
              v-else 
              class="block h-6 w-6" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-gray-800 border-t border-gray-700">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <NuxtLink 
          to="/dashboard" 
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
          active-class="text-blue-400 bg-gray-700 border-l-4 border-blue-500"
        >
          Dashboard
        </NuxtLink>
        <NuxtLink 
          to="/gaming-stats" 
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
          active-class="text-blue-400 bg-gray-700 border-l-4 border-blue-500"
        >
          Stats
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const mobileMenuOpen = ref(false);
</script>

<style scoped>
.gaming-text {
  background: linear-gradient(90deg, #60a5fa, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.filter.drop-shadow-glow {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
}
</style> 