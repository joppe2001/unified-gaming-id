import { 
  signInWithPopup, 
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Auth
} from 'firebase/auth';
import { doc, setDoc, getDoc, type Firestore } from 'firebase/firestore';

export const useAuth = () => {
  const { $auth, $firestore } = useNuxtApp();
  const user = useState<User | null>('user', () => null);
  const loading = useState<boolean>('loading', () => true);
  const error = useState<string | null>('authError', () => null);

  // Check if Firebase is initialized
  if (!$auth || !$firestore) {
    error.value = 'Firebase is not initialized. Check your environment variables.';
    loading.value = false;
    return {
      user,
      loading,
      error,
      signInWithGoogle: () => Promise.reject(new Error('Firebase not initialized')),
      signOut: () => Promise.reject(new Error('Firebase not initialized'))
    };
  }

  const auth = $auth as Auth;
  const firestore = $firestore as Firestore;

  // Initialize auth state
  onMounted(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser;
      loading.value = false;
    }, (err) => {
      console.error('Auth state error:', err);
      error.value = err.message;
      loading.value = false;
    });
    
    // Cleanup on component unmount
    onUnmounted(() => unsubscribe());
  });

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      error.value = null;
      loading.value = true;
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);
      return result.user;
    } catch (err: any) {
      console.error('Error signing in with Google:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Create or update user profile in Firestore
  const createUserProfile = async (user: User) => {
    if (!user) return;
    
    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
        connectedAccounts: {}
      });
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      error.value = null;
      loading.value = true;
      await firebaseSignOut(auth);
    } catch (err: any) {
      console.error('Error signing out:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut
  };
}; 