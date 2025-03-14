<template>
  <!-- Header with responsive navigation -->
  <header class="bg-gray-900 shadow-lg sticky top-0 z-60 border-b border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 md:h-20">
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <NuxtLink to="/" class="text-xl md:text-2xl font-bold text-white flex items-center">
              <svg class="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 text-blue-400 filter drop-shadow-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span class="truncate gaming-text">Unified Gaming ID</span>
            </NuxtLink>
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
            @click="mobileMenuOpen = false"
          >
            <span class="sr-only">Profile</span>
            <svg class="h-6 w-6 filter drop-shadow-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </NuxtLink>
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen" 
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
            :aria-expanded="mobileMenuOpen"
          >
            <span class="sr-only">{{ mobileMenuOpen ? 'Close main menu' : 'Open main menu' }}</span>
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
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0"
    >
      <div v-if="mobileMenuOpen" class="absolute left-0 right-0 top-16 md:hidden bg-gray-800 border-t border-gray-700 shadow-lg z-50">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <NuxtLink 
            to="/dashboard" 
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            active-class="text-blue-400 bg-gray-700 border-l-4 border-blue-500 pl-2"
            @click="mobileMenuOpen = false"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink 
            to="/gaming-stats" 
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            active-class="text-blue-400 bg-gray-700 border-l-4 border-blue-500 pl-2"
            @click="mobileMenuOpen = false"
          >
            Stats
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const mobileMenuOpen = ref(false);
const route = useRoute();

// Close mobile menu when route changes
watch(() => route.path, () => {
  mobileMenuOpen.value = false;
});

// Close mobile menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    const header = document.querySelector('header');
    const target = event.target as HTMLElement;
    
    // Don't close if the click is on the menu button or its children
    const buttonElement = target.closest('button');
    if (buttonElement && buttonElement.getAttribute('aria-expanded') !== null) {
      return;
    }
    
    // Only close if menu is open, click is outside header, and not during the same tick as opening
    if (mobileMenuOpen.value && header && !header.contains(target)) {
      mobileMenuOpen.value = false;
    }
  }, { capture: true });
});
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

/* Add a subtle pulse animation to the logo on hover */
@keyframes pulse-subtle {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5)); }
  50% { filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.7)); }
}

a:hover .filter.drop-shadow-glow {
  animation: pulse-subtle 2s infinite;
}
</style> 