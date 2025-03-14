import { defineEventHandler } from 'h3';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const user = await getFirebaseUser(event);
    if (!user) {
      return { statusCode: 401, body: { error: 'Unauthorized' } };
    }
    
    // Get user profile from Firestore
    const db = getFirestore();
    
    // Configure Firestore settings to ignore undefined properties
    const settings = { ignoreUndefinedProperties: true };
    db.settings(settings);
    
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      // Create user document if it doesn't exist
      // Make sure to handle potentially undefined values
      const userData = {
        uid: user.uid,
        email: user.email || null,
        displayName: user.name || user.displayName || null,
        photoURL: user.picture || null,
        createdAt: new Date(),
        connectedAccounts: {}
      };
      
      console.log('Creating new user document:', userData);
      
      await db.collection('users').doc(user.uid).set(userData);
      return userData;
    }
    
    // Get the existing user data
    const userData = userDoc.data() as Record<string, any>;
    
    // Update the photoURL if it's missing but available in the token
    if (!userData.photoURL && user.picture) {
      await db.collection('users').doc(user.uid).update({
        photoURL: user.picture
      });
      
      userData.photoURL = user.picture;
    }
    
    // Update displayName if it's missing but available in the token
    if (!userData.displayName && (user.name || user.displayName)) {
      await db.collection('users').doc(user.uid).update({
        displayName: user.name || user.displayName || null
      });
      
      userData.displayName = user.name || user.displayName || null;
    }
    
    return userData;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { statusCode: 500, body: { error: 'Internal server error' } };
  }
}); 