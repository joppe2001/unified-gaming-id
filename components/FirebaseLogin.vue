<template>
  <div class="firebase-login space-y-6">
    <!-- Email/Password Login Form -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-lg font-semibold mb-4">Sign in with Email</h3>
      
      <form @submit.prevent="signInWithEmail" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            required 
            autocomplete="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            required 
            autocomplete="current-password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        
        <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ error }}
        </div>
        
        <div class="flex items-center justify-between">
          <button 
            type="submit" 
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>
          
          <button 
            type="button" 
            @click="showRegisterForm = !showRegisterForm" 
            class="text-blue-600 hover:text-blue-800 text-sm"
          >
            {{ showRegisterForm ? 'Back to Login' : 'Create Account' }}
          </button>
        </div>
      </form>
    </div>
    
    <!-- Registration Form -->
    <div v-if="showRegisterForm" class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-lg font-semibold mb-4">Create Account</h3>
      
      <form @submit.prevent="registerWithEmail" class="space-y-4">
        <div>
          <label for="register-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            id="register-email" 
            v-model="registerEmail" 
            type="email" 
            required 
            autocomplete="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label for="register-password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            id="register-password" 
            v-model="registerPassword" 
            type="password" 
            required 
            autocomplete="new-password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        
        <div>
          <label for="display-name" class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input 
            id="display-name" 
            v-model="displayName" 
            type="text" 
            required 
            autocomplete="name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your Name"
          />
        </div>
        
        <div v-if="registerError" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ registerError }}
        </div>
        
        <button 
          type="submit" 
          class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
          :disabled="registerLoading"
        >
          <span v-if="registerLoading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Account...
          </span>
          <span v-else>Create Account</span>
        </button>
      </form>
    </div>
    
    <!-- Social Login Buttons -->
    <div class="flex flex-col space-y-3">
      <button 
        @click="handleGoogleSignIn" 
        class="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 border border-gray-300 rounded transition-colors"
        :disabled="loading"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        <span>Sign in with Google</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFirebase } from '~/composables/useFirebase';

const { signInWithEmail: firebaseSignInWithEmail, createUser, signInWithGoogle } = useFirebase();

// Email/Password login
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

// Registration
const showRegisterForm = ref(false);
const registerEmail = ref('');
const registerPassword = ref('');
const displayName = ref('');
const registerLoading = ref(false);
const registerError = ref('');

// Sign in with email and password
const signInWithEmail = async () => {
  if (!email.value || !password.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    await firebaseSignInWithEmail(email.value, password.value);
    // Redirect happens automatically via the onMounted hook in the login page
  } catch (err: any) {
    error.value = err.message || 'Failed to sign in';
    console.error('Error signing in:', err);
  } finally {
    loading.value = false;
  }
};

// Register with email and password
const registerWithEmail = async () => {
  if (!registerEmail.value || !registerPassword.value || !displayName.value) return;
  
  registerLoading.value = true;
  registerError.value = '';
  
  try {
    await createUser(registerEmail.value, registerPassword.value, displayName.value);
    
    // Reset form and show login
    registerEmail.value = '';
    registerPassword.value = '';
    displayName.value = '';
    showRegisterForm.value = false;
    
    // Redirect happens automatically via the onMounted hook in the login page
  } catch (err: any) {
    registerError.value = err.message || 'Failed to create account';
    console.error('Error registering:', err);
  } finally {
    registerLoading.value = false;
  }
};

// Sign in with Google
const handleGoogleSignIn = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // This will redirect to Google, so we won't reach the code below
    // until the user returns from the redirect
    await signInWithGoogle();
  } catch (err: any) {
    error.value = err.message || 'Failed to sign in with Google';
    console.error('Error signing in with Google:', err);
    loading.value = false;
  }
  // Note: We don't need the finally block because the page will redirect
};
</script> 