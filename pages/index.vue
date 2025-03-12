<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="text-center">
      <h1 class="text-3xl font-bold mb-6">Unified Game ID Maker</h1>
      <p class="text-xl mb-8">Connect all your gaming accounts in one place</p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink 
          to="/login" 
          class="py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-center"
        >
          Sign In
        </NuxtLink>
        
        <NuxtLink 
          to="/dashboard" 
          class="py-3 px-6 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-center"
        >
          Dashboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// If user is already logged in, redirect to dashboard
const { user, loading } = useAuth();

watch([user, loading], ([newUser, isLoading]) => {
  if (!isLoading && newUser) {
    navigateTo('/dashboard');
  }
});
</script> 