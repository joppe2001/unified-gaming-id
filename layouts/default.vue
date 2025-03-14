<template>
  <div class="min-h-screen bg-gray-900 relative">
    <!-- Subtle pattern overlay -->
    <div class="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
    
    <!-- Use the new AppHeader component -->
    <AppHeader />

    <!-- Main content -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// No need for mobileMenuOpen ref anymore as it's moved to the AppHeader component
</script>

<style>
.bg-grid-pattern {
  background-image: 
    linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
}
</style> 