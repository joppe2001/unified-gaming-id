<template>
  <div class="firebase-login space-y-6">
    <!-- Page Title -->
    <div class="text-center">
      <h2 class="text-2xl font-bold">{{ showRegisterForm ? 'Create Account' : 'Login' }}</h2>
      <p class="text-gray-600 mt-2">{{ showRegisterForm ? 'Create a new account to get started' : 'Sign in to connect your gaming profiles' }}</p>
    </div>
    
    <!-- Email/Password Login Form -->
    <div v-if="!showRegisterForm" class="bg-white p-6 rounded-lg shadow-md">
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
        
        <button 
          type="submit" 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          :disabled="loading"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
          <span v-else>Sign In</span>
        </button>
        
        <div class="text-center mt-4">
          <button 
            type="button" 
            @click="showRegisterForm = true" 
            class="text-blue-600 hover:text-blue-800 text-sm"
          >
            Don't have an account? Create one
          </button>
        </div>
      </form>
    </div>
    
    <!-- Registration Form -->
    <div v-if="showRegisterForm" class="bg-white p-6 rounded-lg shadow-md">
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
            @input="checkPasswordStrength"
          />
          <div v-if="registerPassword" class="mt-2">
            <div class="flex items-center">
              <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full transition-all duration-300"
                  :class="{
                    'bg-red-500': passwordStrength === 'weak',
                    'bg-yellow-500': passwordStrength === 'medium',
                    'bg-green-500': passwordStrength === 'strong'
                  }"
                  :style="{ width: passwordStrengthPercent + '%' }"
                ></div>
              </div>
              <span class="ml-2 text-sm" :class="{
                'text-red-500': passwordStrength === 'weak',
                'text-yellow-500': passwordStrength === 'medium',
                'text-green-500': passwordStrength === 'strong'
              }">{{ passwordStrength }}</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Use at least 8 characters with a mix of letters, numbers & symbols
            </p>
          </div>
        </div>
        
        <div>
          <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input 
            id="confirm-password" 
            v-model="confirmPassword" 
            type="password" 
            required 
            autocomplete="new-password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
          <p v-if="confirmPassword && confirmPassword !== registerPassword" class="text-xs text-red-500 mt-1">
            Passwords do not match
          </p>
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
        
        <div class="text-center mt-4">
          <button 
            type="button" 
            @click="showRegisterForm = false" 
            class="text-blue-600 hover:text-blue-800 text-sm"
          >
            Already have an account? Sign in
          </button>
        </div>
      </form>
    </div>
    
    <!-- Social Login Buttons -->
    <div v-if="!showRegisterForm" class="bg-white p-6 rounded-lg shadow-md">
      <p class="text-center text-gray-600 mb-4">Or continue with</p>
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
        
        <button 
          @click="handleRiotSignIn" 
          class="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 border border-red-500 rounded transition-colors"
          :disabled="loading"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12.534 21.77l-1.09-2.81 10.52.54-.451 4.5zM15.06 0L.307 6.969 2.59 17.471H5.6l-.52-7.512 3.541-1.5v9.012h3.121v-9.6l3.121-1.35-.54 10.95h3.121L19.334 0z"/>
          </svg>
          <span>Sign in with Riot Games</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFirebase } from '~/composables/useFirebase';

const { signInWithEmail: firebaseSignInWithEmail, createUser, signInWithGoogle, signInWithRiot } = useFirebase();

// Email/Password login
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

// Registration
const showRegisterForm = ref(false);
const registerEmail = ref('');
const registerPassword = ref('');
const confirmPassword = ref('');
const displayName = ref('');
const registerLoading = ref(false);
const registerError = ref('');
const passwordStrength = ref('');
const passwordStrengthPercent = ref(0);

// Check password strength
const checkPasswordStrength = () => {
  const password = registerPassword.value;
  
  if (!password) {
    passwordStrength.value = '';
    passwordStrengthPercent.value = 0;
    return;
  }
  
  // Calculate password strength
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // Character variety checks
  if (/[A-Z]/.test(password)) strength += 1; // Has uppercase
  if (/[a-z]/.test(password)) strength += 1; // Has lowercase
  if (/[0-9]/.test(password)) strength += 1; // Has number
  if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Has special char
  
  // Set strength label and percentage
  if (strength <= 2) {
    passwordStrength.value = 'weak';
    passwordStrengthPercent.value = 33;
  } else if (strength <= 4) {
    passwordStrength.value = 'medium';
    passwordStrengthPercent.value = 66;
  } else {
    passwordStrength.value = 'strong';
    passwordStrengthPercent.value = 100;
  }
};

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
  
  // Check if passwords match
  if (registerPassword.value !== confirmPassword.value) {
    registerError.value = 'Passwords do not match';
    return;
  }
  
  // Check if password is too weak
  if (passwordStrength.value === 'weak') {
    registerError.value = 'Please use a stronger password';
    return;
  }
  
  registerLoading.value = true;
  registerError.value = '';
  
  try {
    await createUser(registerEmail.value, registerPassword.value, displayName.value);
    
    // Reset form and show login
    registerEmail.value = '';
    registerPassword.value = '';
    confirmPassword.value = '';
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

// Sign in with Riot Games
const handleRiotSignIn = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // This will redirect to Riot Games, so we won't reach the code below
    // until the user returns from the redirect
    await signInWithRiot();
  } catch (err: any) {
    error.value = err.message || 'Failed to sign in with Riot Games';
    console.error('Error signing in with Riot Games:', err);
    loading.value = false;
  }
  // Note: We don't need the finally block because the page will redirect
};
</script> 