import { H3Event, parseCookies } from 'h3';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
    
    // Configure Firestore to ignore undefined properties
    const db = getFirestore();
    db.settings({ ignoreUndefinedProperties: true });
    console.log('Firestore initialized with ignoreUndefinedProperties: true');
  } else {
    console.warn('Firebase Admin SDK not initialized: missing credentials');
  }
}

/**
 * Get the authenticated Firebase user from the request
 */
export const getFirebaseUser = async (event: H3Event) => {
  try {
    const cookies = parseCookies(event);
    const idToken = cookies.idToken;
    
    if (!idToken) {
      return null;
    }
    
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error getting Firebase user:', error);
    return null;
  }
};

/**
 * Create a Firebase custom token for a Steam user
 * @param steamId The Steam ID of the user
 * @param steamProfile Additional Steam profile data to include in the token
 */
export const createFirebaseCustomToken = async (steamId: string, steamProfile: any) => {
  try {
    // Check if a user with this Steam ID already exists
    const userRecord = await getAuth().getUserByProviderUid('steam.com', steamId)
      .catch(() => null);
    
    let uid;
    
    if (userRecord) {
      // User exists, use their UID
      uid = userRecord.uid;
    } else {
      // Create a new user with this Steam ID
      const newUser = await getAuth().createUser({
        providerToLink: {
          providerId: 'steam.com',
          uid: steamId
        },
        displayName: steamProfile.personaName
      });
      uid = newUser.uid;
    }
    
    // Create a custom token for this user
    const customToken = await getAuth().createCustomToken(uid, {
      provider: 'steam',
      steamId: steamId,
      profile: steamProfile
    });
    
    return customToken;
  } catch (error) {
    console.error('Error creating Firebase custom token:', error);
    throw error;
  }
}; 