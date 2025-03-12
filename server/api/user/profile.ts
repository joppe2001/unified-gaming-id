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
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      // Create user document if it doesn't exist
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.name,
        photoURL: user.picture,
        createdAt: new Date(),
        connectedAccounts: {}
      };
      
      await db.collection('users').doc(user.uid).set(userData);
      return userData;
    }
    
    return userDoc.data();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { statusCode: 500, body: { error: 'Internal server error' } };
  }
}); 