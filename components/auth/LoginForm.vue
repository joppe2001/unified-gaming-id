<template>
  <div class="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6">Sign In</h2>
    
    <div v-if="error" class="w-full p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>
    
    <div class="w-full space-y-4">
      <button 
        @click="signInWithGoogle" 
        :disabled="loading"
        class="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="!loading" class="w-5 h-5" viewBox="0 0 24 24">
          <!-- Google icon SVG path -->
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></span>
        {{ loading ? 'Signing in...' : 'Sign in with Google' }}
      </button>
      
      <!-- Placeholders for other auth providers - to be implemented later -->
      <button class="w-full py-2 px-4 bg-gray-800 text-white rounded-md opacity-50 cursor-not-allowed">
        Sign in with Steam (Coming Soon)
      </button>
      
      <button class="w-full py-2 px-4 bg-gray-800 text-white rounded-md opacity-50 cursor-not-allowed">
        Sign in with Epic (Coming Soon)
      </button>
      
      <button class="w-full py-2 px-4 bg-gray-800 text-white rounded-md opacity-50 cursor-not-allowed">
        Sign in with Xbox (Coming Soon)
      </button>
      
      <button class="w-full py-2 px-4 bg-gray-800 text-white rounded-md opacity-50 cursor-not-allowed">
        Sign in with PlayStation (Coming Soon)
      </button>
      
      <button class="w-full py-2 px-4 bg-gray-800 text-white rounded-md opacity-50 cursor-not-allowed">
        Sign in with Riot Games (Coming Soon)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signInWithGoogle, loading, error } = useAuth();
</script> 