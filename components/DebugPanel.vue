<template>
  <div>
    <div v-if="showDebugInfo" class="text-left mb-4 p-2 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-60">
      <div><strong>Debug Info:</strong></div>
      <div>Loading: {{ loading }}</div>
      <div>Show: {{ show }}</div>
      <div>Game ID: {{ game?.appid }}</div>
      <div>Achievements: {{ achievements.length }}</div>
      <div>Cached: {{ achievementsInfo.cached }}</div>
      <div>Private: {{ achievementsInfo.isPrivate }}</div>
      <div>Fallback: {{ achievementsInfo.isFallback }}</div>
      <div>Bypassed Privacy: {{ achievementsInfo.bypassedPrivacy }}</div>
      <div>Forced: {{ achievementsInfo.forced }}</div>
      <div>Unlocked: {{ achievements.filter(a => a.unlocked).length }}</div>
      <div v-if="achievements.length > 0">
        <div class="mt-2"><strong>Sample Achievement:</strong></div>
        <pre>{{ JSON.stringify(achievements[0], null, 2) }}</pre>
      </div>
      
      <div class="mt-2">
        <button 
          @click="checkPrivacySettings" 
          class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 mr-2"
          :disabled="checkingPrivacy"
        >
          {{ checkingPrivacy ? 'Checking...' : 'Check Privacy Settings' }}
        </button>
        
        <button 
          @click="forceAchievements" 
          class="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
          :disabled="forcingAchievements"
        >
          {{ forcingAchievements ? 'Forcing...' : 'Force Achievements' }}
        </button>
      </div>
      
      <div v-if="privacyInfo" class="mt-2 p-2 bg-white rounded">
        <div><strong>Privacy Check Results:</strong></div>
        <div v-if="privacyInfo.errors.length > 0" class="text-red-500">
          <div v-for="(error, index) in privacyInfo.errors" :key="index">
            - {{ error }}
          </div>
        </div>
        <div v-else class="text-green-500">
          Your Steam profile appears to be correctly configured.
        </div>
        
        <div v-if="privacyInfo.privacyInstructions" class="mt-2 text-blue-600">
          <div v-for="(instruction, index) in privacyInfo.privacyInstructions" :key="index">
            {{ instruction }}
          </div>
        </div>
        
        <div v-if="privacyInfo.profileInfo" class="mt-2">
          <div><strong>Profile Info:</strong></div>
          <div>Visibility: {{ getVisibilityText(privacyInfo.profileInfo.communityvisibilitystate) }}</div>
          <div>Profile URL: <a :href="privacyInfo.profileInfo.profileurl" target="_blank" class="text-blue-500 hover:underline">{{ privacyInfo.profileInfo.personaname }}</a></div>
        </div>
        
        <div v-if="privacyInfo.achievementsInfo" class="mt-2">
          <div><strong>Achievements Info:</strong></div>
          <div>Success: {{ privacyInfo.achievementsInfo.success ? 'Yes' : 'No' }}</div>
          <div>Game: {{ privacyInfo.achievementsInfo.gameName }}</div>
          <div>Achievement Count: {{ privacyInfo.achievementsInfo.achievementCount }}</div>
        </div>
      </div>
    </div>
    
    <div class="flex justify-between">
      <button 
        @click="toggleDebugInfo" 
        class="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {{ showDebugInfo ? 'Hide Debug' : 'Show Debug' }}
      </button>
      
      <button 
        @click="close" 
        class="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Define interfaces
interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  iconUrl: string;
  iconGrayUrl?: string;
  unlocked: boolean;
  unlockTime?: number;
  globalPercentage?: number;
}

interface Game {
  appid: string | number;
  name: string;
}

interface AchievementsInfo {
  isPrivate: boolean;
  cached: boolean;
  hasAchievements: boolean;
  isFallback: boolean;
  bypassedPrivacy: boolean;
  forced: boolean;
}

interface PrivacyInfo {
  errors: string[];
  privacyInstructions?: string[];
  profileInfo?: {
    communityvisibilitystate: number;
    profileurl: string;
    personaname: string;
  };
  achievementsInfo?: {
    success: boolean;
    gameName: string;
    achievementCount: number;
  };
}

const props = defineProps({
  game: {
    type: Object as () => Game,
    required: true
  },
  achievements: {
    type: Array as () => Achievement[],
    default: () => []
  },
  achievementsInfo: {
    type: Object as () => AchievementsInfo,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  show: {
    type: Boolean,
    default: false
  },
  checkingPrivacy: {
    type: Boolean,
    default: false
  },
  forcingAchievements: {
    type: Boolean,
    default: false
  },
  privacyInfo: {
    type: Object as () => PrivacyInfo | null,
    default: null
  }
});

const emit = defineEmits(['close', 'checkPrivacy', 'forceAchievements']);

const showDebugInfo = ref(false);

const toggleDebugInfo = () => {
  showDebugInfo.value = !showDebugInfo.value;
};

const close = () => {
  emit('close');
};

const checkPrivacySettings = () => {
  emit('checkPrivacy');
};

const forceAchievements = () => {
  emit('forceAchievements');
};

// Add a getVisibilityText function
const getVisibilityText = (visibility: number) => {
  switch (visibility) {
    case 1:
      return 'Private';
    case 2:
      return 'Friends Only';
    case 3:
      return 'Public';
    default:
      return `Unknown (${visibility})`;
  }
};
</script> 