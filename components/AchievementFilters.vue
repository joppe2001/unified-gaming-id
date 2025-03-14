<template>
  <div>
    <!-- Filter controls - restructured for better mobile experience -->
    <div class="mb-4 space-y-3 sm:space-y-0 flex flex-col lg:flex-row">
      <!-- Filter section -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="text-sm font-medium text-gray-400 w-full sm:w-auto">Filter:</div>
        <div class="flex flex-wrap gap-2">
          <button 
            @click="toggleFilter('unlocked')" 
            class="text-xs px-3 py-1.5 rounded-md cursor-pointer flex items-center transition-colors border"
            :class="activeFilter === 'unlocked' 
              ? 'bg-green-900/50 text-green-300 border-green-700' 
              : 'bg-gray-900/50 text-gray-300 border-gray-700 hover:bg-gray-800/50'"
          >
            Unlocked
            <svg v-if="activeFilter === 'unlocked'" class="h-3 w-3 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button 
            @click="toggleFilter('locked')" 
            class="text-xs px-3 py-1.5 rounded-md cursor-pointer flex items-center transition-colors border"
            :class="activeFilter === 'locked' 
              ? 'bg-gray-900/50 text-gray-300 border-gray-600' 
              : 'bg-gray-900/50 text-gray-300 border-gray-700 hover:bg-gray-800/50'"
          >
            Locked
            <svg v-if="activeFilter === 'locked'" class="h-3 w-3 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Sort section -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="text-sm font-medium text-gray-400 w-full sm:w-auto sm:ml-4">Sort by:</div>
        <div class="flex flex-wrap gap-2">
          <button 
            @click="toggleSort('name')" 
            class="text-xs px-3 py-1.5 rounded-md cursor-pointer flex items-center transition-colors border"
            :class="activeSort === 'name' 
              ? 'bg-blue-900/50 text-blue-300 border-blue-700' 
              : 'bg-gray-900/50 text-gray-300 border-gray-700 hover:bg-gray-800/50'"
          >
            Name
            <svg v-if="activeSort === 'name'" class="h-3 w-3 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button 
            @click="toggleSort('rarity')" 
            class="text-xs px-3 py-1.5 rounded-md cursor-pointer flex items-center transition-colors border"
            :class="activeSort === 'rarity' 
              ? 'bg-blue-900/50 text-blue-300 border-blue-700' 
              : 'bg-gray-900/50 text-gray-300 border-gray-700 hover:bg-gray-800/50'"
          >
            Rarity
            <svg v-if="activeSort === 'rarity'" class="h-3 w-3 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button 
            v-if="hasUnlockTimes"
            @click="toggleSort('date')" 
            class="text-xs px-3 py-1.5 rounded-md cursor-pointer flex items-center transition-colors border"
            :class="activeSort === 'date' 
              ? 'bg-blue-900/50 text-blue-300 border-blue-700' 
              : 'bg-gray-900/50 text-gray-300 border-gray-700 hover:bg-gray-800/50'"
          >
            Unlock Date
            <svg v-if="activeSort === 'date'" class="h-3 w-3 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button 
            @click="toggleSortOrder" 
            class="text-xs px-3 py-1.5 rounded-md flex items-center cursor-pointer transition-colors border"
            :class="activeSort !== 'default'
              ? 'bg-blue-900/50 text-blue-300 border-blue-700 hover:bg-blue-800/50'
              : 'bg-gray-900/50 text-gray-300 border-gray-700 hover:bg-gray-800/50'"
          >
            <svg 
              class="h-3 w-3 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              :class="{ 'transform rotate-180': sortOrder === 'desc' }"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            {{ sortOrder === 'asc' ? 'Ascending' : 'Descending' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Search filter -->
    <div class="mb-4">
      <div class="relative">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search achievements..." 
          class="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-md text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @input="updateSearch"
        />
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
          <svg 
            class="h-4 w-4 text-gray-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button 
          v-if="searchQuery" 
          @click="clearSearch" 
          class="absolute inset-y-0 right-8 pr-3 flex items-center cursor-pointer"
          aria-label="Clear search"
        >
          <svg class="h-4 w-4 text-gray-500 hover:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Active filters display -->
    <div v-if="hasActiveFilters" class="mb-4 flex flex-wrap gap-2 items-center">
      <div class="text-sm text-gray-400 w-full sm:w-auto mb-1 sm:mb-0">Active filters:</div>
      <div class="flex flex-wrap gap-2">
        <div v-if="activeFilter !== 'all'" class="flex items-center bg-blue-900/30 text-blue-300 text-xs px-3 py-1.5 rounded-md border border-blue-700">
          {{ activeFilter === 'unlocked' ? 'Unlocked only' : 'Locked only' }}
          <button @click="clearFilter" class="ml-2 text-blue-400 hover:text-blue-300 cursor-pointer">
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="activeSort !== 'default'" class="flex items-center bg-blue-900/30 text-blue-300 text-xs px-3 py-1.5 rounded-md border border-blue-700">
          Sorted by {{ getSortLabel() }} ({{ sortOrder === 'asc' ? 'Ascending' : 'Descending' }})
          <button @click="clearSort" class="ml-2 text-blue-400 hover:text-blue-300 cursor-pointer">
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="searchQuery" class="flex items-center bg-blue-900/30 text-blue-300 text-xs px-3 py-1.5 rounded-md border border-blue-700">
          Search: "{{ searchQuery }}"
          <button @click="clearSearch" class="ml-2 text-blue-400 hover:text-blue-300 cursor-pointer">
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Achievement count after filtering -->
    <div v-if="filteredCount !== totalCount" class="mb-4 text-sm text-gray-400">
      Showing {{ filteredCount }} of {{ totalCount }} achievements
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
  filterStatus: {
    type: String,
    default: 'all'
  },
  sortBy: {
    type: String,
    default: 'default'
  },
  sortOrder: {
    type: String,
    default: 'asc'
  },
  hasUnlockTimes: {
    type: Boolean,
    default: false
  },
  filteredCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  },
  searchQuery: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:filterStatus', 'update:sortBy', 'update:sortOrder', 'update:searchQuery']);

const searchQuery = ref('');
const activeFilter = ref('all');
const activeSort = ref('default');

// Computed property to check if any filters are active
const hasActiveFilters = computed(() => {
  return activeFilter.value !== 'all' || activeSort.value !== 'default' || searchQuery.value.trim() !== '';
});

// Toggle filter function - if the same filter is clicked again, revert to 'all'
const toggleFilter = (filter: string) => {
  if (activeFilter.value === filter) {
    activeFilter.value = 'all';
  } else {
    activeFilter.value = filter;
  }
  emit('update:filterStatus', activeFilter.value);
};

// Toggle sort function - if the same sort is clicked again, revert to 'default'
const toggleSort = (sort: string) => {
  if (activeSort.value === sort) {
    activeSort.value = 'default';
  } else {
    activeSort.value = sort;
  }
  emit('update:sortBy', activeSort.value);
};

// Toggle sort order
const toggleSortOrder = () => {
  emit('update:sortOrder', props.sortOrder === 'asc' ? 'desc' : 'asc');
};

// Update search
const updateSearch = () => {
  emit('update:searchQuery', searchQuery.value);
};

// Clear filter
const clearFilter = () => {
  activeFilter.value = 'all';
  emit('update:filterStatus', 'all');
};

// Clear sort
const clearSort = () => {
  activeSort.value = 'default';
  emit('update:sortBy', 'default');
};

// Clear search
const clearSearch = () => {
  searchQuery.value = '';
  emit('update:searchQuery', '');
};

// Get sort label for display
const getSortLabel = () => {
  switch (activeSort.value) {
    case 'name':
      return 'Name';
    case 'rarity':
      return 'Rarity';
    case 'date':
      return 'Unlock Date';
    default:
      return 'Default';
  }
};

// Keep local state in sync with parent
watch(() => props.filterStatus, (newValue) => {
  activeFilter.value = newValue;
}, { immediate: true });

watch(() => props.sortBy, (newValue) => {
  activeSort.value = newValue;
}, { immediate: true });

watch(() => props.searchQuery, (newValue) => {
  if (newValue !== undefined) {
    searchQuery.value = newValue;
  }
}, { immediate: true });
</script> 