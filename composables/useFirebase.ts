import { ref, onMounted } from 'vue';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCustomToken as firebaseSignInWithCustomToken,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  updateProfile,
  type Auth,
  type User,
  type UserCredential,
  getRedirectResult,
  getIdToken
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Get Firebase configuration from runtime config
const getFirebaseConfig = () => {
  const runtimeConfig = useRuntimeConfig();
  return {
    apiKey: runtimeConfig.public.firebaseApiKey,
    authDomain: runtimeConfig.public.firebaseAuthDomain,
    projectId: runtimeConfig.public.firebaseProjectId,
    storageBucket: runtimeConfig.public.firebaseStorageBucket,
    messagingSenderId: runtimeConfig.public.firebaseMessagingSenderId,
    appId: runtimeConfig.public.firebaseAppId,
    measurementId: runtimeConfig.public.firebaseMeasurementId
  };
};

// Initialize Firebase lazily
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

const initializeFirebase = () => {
  if (!app) {
    const firebaseConfig = getFirebaseConfig();
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app, auth: auth as Auth, db: db as Firestore };
};

export const useFirebase = () => {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref<Error | null>(null);
  
  // Initialize Firebase when the composable is used
  const { auth, db } = initializeFirebase();

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Store the ID token in a cookie
      await storeIdTokenInCookie(userCredential.user);
      return userCredential;
    } catch (err) {
      error.value = err as Error;
      throw err;
    }
  };

  // Create a new user with email and password
  const createUser = async (email: string, password: string, displayName?: string): Promise<UserCredential> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Store the ID token in a cookie
      await storeIdTokenInCookie(userCredential.user);
      
      return userCredential;
    } catch (err) {
      error.value = err as Error;
      throw err;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<UserCredential> => {
    try {
      const provider = new GoogleAuthProvider();
      // Use signInWithPopup instead of signInWithRedirect for more reliable authentication
      const result = await signInWithPopup(auth, provider);
      
      // Store the ID token in a cookie
      if (result.user) {
        await storeIdTokenInCookie(result.user);
      }
      
      // Return the result
      return result;
    } catch (err) {
      error.value = err as Error;
      console.error('Error signing in with Google:', err);
      throw err;
    }
  };

  // Sign in with Riot Games
  const signInWithRiot = async (): Promise<UserCredential> => {
    try {
      const provider = new OAuthProvider('oidc.riotgames');
      // Add scopes for Riot Games API access
      provider.addScope('openid');
      provider.addScope('email');
      provider.addScope('profile');
      
      // Use signInWithPopup for Riot Games authentication
      const result = await signInWithPopup(auth, provider);
      
      // Store the ID token in a cookie
      if (result.user) {
        await storeIdTokenInCookie(result.user);
      }
      
      // Return the result
      return result;
    } catch (err) {
      error.value = err as Error;
      console.error('Error signing in with Riot Games:', err);
      throw err;
    }
  };

  // Sign in with a custom token (for Steam authentication)
  const signInWithCustomToken = async (token: string): Promise<UserCredential> => {
    try {
      const userCredential = await firebaseSignInWithCustomToken(auth, token);
      user.value = userCredential.user;
      
      // Store the ID token in a cookie
      await storeIdTokenInCookie(userCredential.user);
      
      return userCredential;
    } catch (err) {
      error.value = err as Error;
      throw err;
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      user.value = null;
      
      // Get the base URL from runtime config
      const runtimeConfig = useRuntimeConfig();
      const baseUrl = runtimeConfig.public.baseUrl;
      
      // Extract domain from baseUrl for cookie settings
      const urlObj = new URL(baseUrl);
      const domain = urlObj.hostname;
      
      // Clear the ID token cookie with the same settings used when setting it
      const idTokenCookie = useCookie('idToken', {
        path: '/',
        // Only set domain for production (not localhost)
        ...(domain !== 'localhost' && { domain })
      });
      idTokenCookie.value = null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    }
  };

  // Store the Firebase ID token in a cookie
  const storeIdTokenInCookie = async (currentUser: User) => {
    try {
      const token = await getIdToken(currentUser);
      
      // Get the base URL from runtime config
      const runtimeConfig = useRuntimeConfig();
      const baseUrl = runtimeConfig.public.baseUrl;
      
      // Extract domain from baseUrl for cookie settings
      const urlObj = new URL(baseUrl);
      const domain = urlObj.hostname;
      
      // Use Nuxt's useCookie to store the token
      const idTokenCookie = useCookie('idToken', {
        maxAge: 60 * 60, // 1 hour
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        // Only set domain for production (not localhost)
        ...(domain !== 'localhost' && { domain })
      });
      idTokenCookie.value = token;
    } catch (err) {
      console.error('Error storing ID token:', err);
    }
  };

  // Listen for auth state changes
  onMounted(async () => {
    // Check if we're returning from a redirect sign-in
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        // User successfully signed in with redirect
        user.value = result.user;
        // Store the ID token in a cookie
        await storeIdTokenInCookie(result.user);
      }
    } catch (err) {
      error.value = err as Error;
      console.error('Error getting redirect result:', err);
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        user.value = firebaseUser;
        
        // If user is logged in, store the ID token in a cookie
        if (firebaseUser) {
          await storeIdTokenInCookie(firebaseUser);
        }
        
        loading.value = false;
      },
      (err) => {
        error.value = err;
        loading.value = false;
      }
    );

    // Clean up subscription
    return () => unsubscribe();
  });

  return {
    auth,
    db,
    user,
    loading,
    error,
    signInWithEmail,
    createUser,
    signInWithGoogle,
    signInWithRiot,
    signInWithCustomToken,
    signOut
  };
}; 