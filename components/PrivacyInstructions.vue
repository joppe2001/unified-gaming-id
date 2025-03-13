<template>
  <div>
    <!-- Privacy settings instructions -->
    <div v-if="!showInstructions" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
      <p class="text-sm text-yellow-800">
        <strong>Steam Privacy Settings:</strong> Your achievements are currently private. You can fix this or use the "Bypass Privacy" button above.
      </p>
      <button 
        @click="toggleInstructions(true)" 
        class="mt-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-300"
      >
        Show How to Fix
      </button>
    </div>
    
    <div v-if="showInstructions" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
      <div class="flex justify-between items-start">
        <h5 class="font-medium text-yellow-800">How to Fix Steam Privacy Settings</h5>
        <button 
          @click="toggleInstructions(false)" 
          class="text-yellow-500 hover:text-yellow-700"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <ol class="mt-2 text-sm text-yellow-800 list-decimal pl-5 space-y-1">
        <li>Go to your <a href="https://steamcommunity.com/my/edit/settings" target="_blank" class="text-blue-600 hover:underline">Steam Profile Privacy Settings</a></li>
        <li>Set "Game details" to "Public"</li>
        <li><strong>Important:</strong> Make sure the checkbox "Always keep my total playtime private even if users can see my game details" is <strong>UNCHECKED</strong></li>
        <li>Click "Save Changes" at the bottom of the page</li>
        <li>Wait a few minutes for Steam to update your settings</li>
        <li>Return here and click "Refresh" to update your achievements</li>
      </ol>
      <div class="mt-3 p-2 bg-blue-50 rounded-md text-xs text-blue-800">
        <p><strong>Note:</strong> Steam's API error message is: "Profile is not public" - This specifically refers to your game statistics being private, not your entire profile.</p>
        <p class="mt-1">If you've already set everything to public, try waiting 24 hours as Steam can take time to update privacy settings in their API.</p>
      </div>
    </div>
    
    <!-- Bypassed privacy warning -->
    <div v-if="bypassedPrivacy" class="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
      <p class="text-sm text-purple-800">
        <strong>Note:</strong> Your achievements are being shown with bypassed privacy settings. The unlocked status may not be accurate.
        For accurate achievement data, please update your <a href="https://steamcommunity.com/my/edit/settings" target="_blank" class="text-blue-600 hover:underline">Steam privacy settings</a>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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