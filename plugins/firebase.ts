import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Define a type for our plugin return
type FirebasePluginReturn = {
  firebase: ReturnType<typeof initializeApp>;
  auth: Auth;
  firestore: Firestore;
};

export default defineNuxtPlugin<FirebasePluginReturn>(() => {
  try {
    const runtimeConfig = useRuntimeConfig();
    
    const config = {
      apiKey: runtimeConfig.public.firebaseApiKey,
      authDomain: runtimeConfig.public.firebaseAuthDomain,
      projectId: runtimeConfig.public.firebaseProjectId,
      storageBucket: runtimeConfig.public.firebaseStorageBucket,
      messagingSenderId: runtimeConfig.public.firebaseMessagingSenderId,
      appId: runtimeConfig.public.firebaseAppId,
      measurementId: runtimeConfig.public.firebaseMeasurementId
    };

    // Initialize Firebase only if it hasn't been initialized yet
    const app = !getApps().length ? initializeApp(config) : getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    return {
      provide: {
        firebase: app,
        auth,
        firestore
      }
    };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    
    // We need to throw an error instead of returning null values
    // This will prevent the plugin from loading with invalid values
    throw error;
  }
});

