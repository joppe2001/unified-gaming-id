<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-semibold mb-4 text-red-600">Firestore API Not Enabled</h3>
    
    <p class="mb-4">
      The Firestore API is not enabled for your Firebase project. You need to enable it to use the Steam login feature.
    </p>
    
    <div class="bg-gray-100 p-4 rounded-md mb-4">
      <h4 class="font-medium mb-2">Follow these steps to enable Firestore:</h4>
      <ol class="list-decimal pl-5 space-y-2">
        <li>Go to the <a href="https://console.cloud.google.com/apis/library/firestore.googleapis.com" target="_blank" class="text-blue-600 hover:underline">Google Cloud Console</a></li>
        <li>Make sure you're logged in with the same Google account you use for Firebase</li>
        <li>Select your project "unified-game-id-maker" from the dropdown at the top</li>
        <li>Click the "Enable" button to enable the Firestore API</li>
        <li>Wait a few minutes for the changes to propagate</li>
        <li>Return to this app and try connecting to Steam again</li>
      </ol>
    </div>
    
    <div class="bg-yellow-50 p-4 rounded-md border border-yellow-200">
      <h4 class="font-medium mb-2 text-yellow-800">Important Note:</h4>
      <p class="text-yellow-800">
        If you haven't created a Firestore database yet, you'll also need to do that in the Firebase Console:
      </p>
      <ol class="list-decimal pl-5 space-y-2 text-yellow-800">
        <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" class="text-blue-600 hover:underline">Firebase Console</a></li>
        <li>Select your project "unified-game-id-maker"</li>
        <li>Click on "Firestore Database" in the left sidebar</li>
        <li>Click "Create database"</li>
        <li>Choose either "Production mode" or "Test mode" (you can change this later)</li>
        <li>Select a location for your database (choose one close to your users)</li>
        <li>Click "Enable"</li>
      </ol>
    </div>
    
    <div class="mt-4">
      <button 
        @click="refreshPage" 
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        Refresh Page
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const refreshPage = () => {
  window.location.reload();
};
</script> 