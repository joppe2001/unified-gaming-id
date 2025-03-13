import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export default defineEventHandler(async (event) => {
  try {
    // Get the ID token from the cookie
    const idTokenCookie = getCookie(event, 'idToken');
    
    if (!idTokenCookie) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized: You must be logged in to disconnect your Riot Games account'
      });
    }
    
    // Verify the ID token
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idTokenCookie);
    const uid = decodedToken.uid;
    
    // Get Firestore instance
    const db = getFirestore();
    
    // Update the user profile to remove the Riot Games account
    await db.collection('users').doc(uid).update({
      'connectedAccounts.riot': null
    });
    
    return { success: true, message: 'Riot Games account disconnected successfully' };
  } catch (error: any) {
    console.error('Error disconnecting Riot Games account:', error);
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to disconnect Riot Games account'
    });
  }
}); 