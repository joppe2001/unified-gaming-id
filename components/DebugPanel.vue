<template>
  <div>
    <div v-if="showDebugInfo" class="text-left mb-4 p-2 bg-gray-900/70 rounded-lg text-xs font-mono overflow-auto max-h-60 border border-gray-700">
      <div><strong class="text-blue-300">Debug Info:</strong></div>
      <div class="text-gray-300">Loading: {{ loading }}</div>
      <div class="text-gray-300">Show: {{ show }}</div>
      <div class="text-gray-300">Game ID: {{ game?.appid }}</div>
      <div class="text-gray-300">Achievements: {{ achievements.length }}</div>
      <div class="text-gray-300">Cached: {{ achievementsInfo.cached }}</div>
      <div class="text-gray-300">Private: {{ achievementsInfo.isPrivate }}</div>
      <div class="text-gray-300">Fallback: {{ achievementsInfo.isFallback }}</div>
      <div class="text-gray-300">Bypassed Privacy: {{ achievementsInfo.bypassedPrivacy }}</div>
      <div class="text-gray-300">Forced: {{ achievementsInfo.forced }}</div>
      <div class="text-gray-300">Unlocked: {{ achievements.filter(a => a.unlocked).length }}</div>
      <div v-if="achievements.length > 0" class="text-gray-300">
        <div class="mt-2"><strong class="text-blue-300">Sample Achievement:</strong></div>
        <pre>{{ JSON.stringify(achievements[0], null, 2) }}</pre>
      </div>
      
      <div class="mt-2">
        <button 
          @click="checkPrivacySettings" 
          class="px-2 py-1 bg-blue-900/50 text-blue-300 rounded-md text-xs hover:bg-blue-800/50 mr-2 border border-blue-700 transition-colors"
          :disabled="checkingPrivacy"
        >
          {{ checkingPrivacy ? 'Checking...' : 'Check Privacy Settings' }}
        </button>
        
        <button 
          @click="forceAchievements" 
          class="px-2 py-1 bg-purple-900/50 text-purple-300 rounded-md text-xs hover:bg-purple-800/50 border border-purple-700 transition-colors"
          :disabled="forcingAchievements"
        >
          {{ forcingAchievements ? 'Forcing...' : 'Force Achievements' }}
        </button>
      </div>
      
      <div v-if="privacyInfo" class="mt-2 p-2 bg-gray-800/70 rounded-lg border border-gray-700">
        <div><strong class="text-blue-300">Privacy Check Results:</strong></div>
        <div v-if="privacyInfo.errors.length > 0" class="text-red-400">
          <div v-for="(error, index) in privacyInfo.errors" :key="index">
            - {{ error }}
          </div>
        </div>
        <div v-else class="text-green-400">
          Your Steam profile appears to be correctly configured.
        </div>
        
        <div v-if="privacyInfo.privacyInstructions" class="mt-2 text-blue-400">
          <div v-for="(instruction, index) in privacyInfo.privacyInstructions" :key="index">
            {{ instruction }}
          </div>
        </div>
        
        <div v-if="privacyInfo.profileInfo" class="mt-2 text-gray-300">
          <div><strong class="text-blue-300">Profile Info:</strong></div>
          <div>Visibility: {{ getVisibilityText(privacyInfo.profileInfo.communityvisibilitystate) }}</div>
          <div>Profile URL: <a :href="privacyInfo.profileInfo.profileurl" target="_blank" class="text-blue-400 hover:text-blue-300 hover:underline transition-colors">{{ privacyInfo.profileInfo.personaname }}</a></div>
        </div>
        
        <div v-if="privacyInfo.achievementsInfo" class="mt-2 text-gray-300">
          <div><strong class="text-blue-300">Achievements Info:</strong></div>
          <div>Success: {{ privacyInfo.achievementsInfo.success ? 'Yes' : 'No' }}</div>
          <div>Game: {{ privacyInfo.achievementsInfo.gameName }}</div>
          <div>Achievement Count: {{ privacyInfo.achievementsInfo.achievementCount }}</div>
        </div>
      </div>
    </div>
    
    <div class="flex justify-between">
      <button 
        @click="toggleDebugInfo" 
        class="inline-flex justify-center px-4 py-2 border border-gray-700 shadow-glow text-sm font-medium rounded-md text-gray-300 bg-gray-900/50 hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        {{ showDebugInfo ? 'Hide Debug' : 'Show Debug' }}
      </button>
      
      <button 
        @click="close" 
        class="inline-flex justify-center px-4 py-2 border border-blue-700 shadow-glow text-sm font-medium rounded-md text-blue-300 bg-blue-900/50 hover:bg-blue-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">

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