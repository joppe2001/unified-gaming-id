<template>
  <div class="h-auto lg:h-[calc(100vh-85px)] flex flex-col md:flex-row items-stretch bg-gray-900 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Animated grid lines -->
      <div class="absolute inset-0 bg-grid-gaming opacity-10"></div>
      
      <!-- Glowing orbs -->
      <div class="glow-orb absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
      <div class="glow-orb-delayed absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600 opacity-20 blur-3xl"></div>
      
      <!-- Diagonal lines -->
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
      <div class="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-30"></div>
      <div class="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
      <div class="absolute bottom-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-30"></div>
    </div>
    
    <!-- Left side - Gaming Branding (hidden on mobile) -->
    <div class="hidden md:flex md:w-1/2 text-white p-8 flex-col justify-between relative z-10">
      <div class="max-w-md mx-auto flex flex-col h-full">
        <!-- Logo/Branding -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold flex items-center text-glow">
            <svg class="w-10 h-10 mr-3 text-blue-400 filter drop-shadow-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <span class="gaming-text">Unified Gaming ID</span>
          </h1>
          <p class="text-blue-300 mt-2 text-lg">Connect all your gaming profiles in one place</p>
        </div>
        
        <!-- Gaming Illustration -->
        <div class="flex-grow flex items-center justify-center">
          <div class="relative w-full max-w-sm">
            <!-- Gaming controller icon with glow effect -->
            <svg class="w-full h-auto text-white opacity-90 filter drop-shadow-glow" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.58 16.09l-1.09-7.66C20.21 6.46 18.52 5 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19c.68 0 1.32-.27 1.8-.75L9 16h6l2.25 2.25c.48.48 1.13.75 1.8.75 1.56 0 2.75-1.37 2.53-2.91zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4-1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
            </svg>
            
            <!-- Decorative elements -->
            <div class="absolute top-0 right-0 w-24 h-24 bg-blue-400 rounded-full opacity-20 blur-lg pulse-slow"></div>
            <div class="absolute bottom-0 left-0 w-32 h-32 bg-purple-400 rounded-full opacity-20 blur-lg pulse-slow-delayed"></div>
          </div>
        </div>
        
        <!-- Features -->
        <div class="mt-8 bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-gray-700 backdrop-blur-sm">
          <h3 class="text-xl font-semibold mb-4 text-blue-300">Connect. Track. Compete.</h3>
          <ul class="space-y-3">
            <li class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-gray-300">Link all your gaming accounts</span>
            </li>
            <li class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-gray-300">Track your stats across platforms</span>
            </li>
            <li class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-gray-300">Share your unified gaming profile</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Right side - Login Form -->
    <div class="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
      <div class="w-full max-w-md">
        <!-- Mobile Logo (visible only on mobile) -->
        <div class="md:hidden text-center mb-8">
          <h1 class="text-2xl font-bold flex items-center justify-center text-white">
            <svg class="w-8 h-8 mr-2 text-blue-400 filter drop-shadow-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <span class="gaming-text">Unified Gaming ID</span>
          </h1>
          <p class="text-blue-300 mt-1">Connect all your gaming profiles</p>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="bg-gray-800 bg-opacity-80 rounded-xl shadow-glow p-8 text-center backdrop-blur-sm border border-gray-700">
          <div class="flex flex-col items-center justify-center py-8">
            <div class="loading-spinner mb-4">
              <div class="spinner-inner"></div>
            </div>
            <h3 class="text-xl font-medium text-blue-300">Checking authentication...</h3>
            <p class="text-gray-400 mt-2">Please wait while we verify your credentials</p>
          </div>
        </div>
        
        <!-- Login Form -->
        <div v-else class="bg-gray-800 bg-opacity-80 rounded-xl shadow-glow overflow-hidden backdrop-blur-sm border border-gray-700">
          <div class="p-8">
            <FirebaseLogin />
          </div>
          
          <!-- Footer -->
          <div class="px-8 py-4 bg-gray-900 bg-opacity-50 border-t border-gray-700 text-center text-sm text-gray-400">
            By signing in, you agree to our 
            <a href="#" class="text-blue-400 hover:text-blue-300 transition-colors">Terms of Service</a> and 
            <a href="#" class="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFirebase } from '~/composables/useFirebase';

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

<style>
.bg-grid-gaming {
  background-image: 
    linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
}

.shadow-glow {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.text-glow {
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

.filter.drop-shadow-glow {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
}

.gaming-text {
  background: linear-gradient(90deg, #60a5fa, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.glow-orb {
  animation: pulse 8s infinite alternate;
}

.glow-orb-delayed {
  animation: pulse 8s infinite alternate-reverse;
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
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: conic-gradient(transparent 0%, rgba(59, 130, 246, 0.8));
  -webkit-mask: radial-gradient(circle at center, transparent 55%, white 55%);
  mask: radial-gradient(circle at center, transparent 55%, white 55%);
  animation: spin 1.5s linear infinite;
}

.spinner-inner {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #60a5fa;
  top: calc(50% - 5px);
  left: calc(50% - 5px);
  box-shadow: 0 0 15px 2px rgba(96, 165, 250, 0.6);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 