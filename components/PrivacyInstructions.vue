<template>
  <div>
    <!-- Privacy settings instructions -->
    <div v-if="!showInstructions" class="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg shadow-glow">
      <p class="text-sm text-yellow-300">
        <strong>Steam Privacy Settings:</strong> Your achievements are currently private. You can fix this or use the "Bypass Privacy" button above.
      </p>
      <button 
        @click="toggleInstructions(true)" 
        class="mt-2 text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded-md hover:bg-yellow-800/50 border border-yellow-700 transition-colors"
      >
        Show How to Fix
      </button>
    </div>
    
    <div v-if="showInstructions" class="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg shadow-glow">
      <div class="flex justify-between items-start">
        <h5 class="font-medium text-yellow-300">How to Fix Steam Privacy Settings</h5>
        <button 
          @click="toggleInstructions(false)" 
          class="text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <ol class="mt-2 text-sm text-yellow-300 list-decimal pl-5 space-y-1">
        <li>Go to your <a href="https://steamcommunity.com/my/edit/settings" target="_blank" class="text-blue-400 hover:text-blue-300 hover:underline transition-colors">Steam Profile Privacy Settings</a></li>
        <li>Set "Game details" to "Public"</li>
        <li><strong>Important:</strong> Make sure the checkbox "Always keep my total playtime private even if users can see my game details" is <strong>UNCHECKED</strong></li>
        <li>Click "Save Changes" at the bottom of the page</li>
        <li>Wait a few minutes for Steam to update your settings</li>
        <li>Return here and click "Refresh" to update your achievements</li>
      </ol>
      <div class="mt-3 p-2 bg-blue-900/30 rounded-md text-xs text-blue-300 border border-blue-700">
        <p><strong>Note:</strong> Steam's API error message is: "Profile is not public" - This specifically refers to your game statistics being private, not your entire profile.</p>
        <p class="mt-1">If you've already set everything to public, try waiting 24 hours as Steam can take time to update privacy settings in their API.</p>
      </div>
    </div>
    
    <!-- Bypassed privacy warning -->
    <div v-if="bypassedPrivacy" class="mb-4 p-3 bg-purple-900/30 border border-purple-700 rounded-lg shadow-glow">
      <p class="text-sm text-purple-300">
        <strong>Note:</strong> Your achievements are being shown with bypassed privacy settings. The unlocked status may not be accurate.
        For accurate achievement data, please update your <a href="https://steamcommunity.com/my/edit/settings" target="_blank" class="text-blue-400 hover:text-blue-300 hover:underline transition-colors">Steam privacy settings</a>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  isPrivate: {
    type: Boolean,
    default: false
  },
  bypassedPrivacy: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:showInstructions']);

const showInstructions = ref(false);

const toggleInstructions = (value: boolean) => {
  showInstructions.value = value;
  emit('update:showInstructions', value);
};
</script> 