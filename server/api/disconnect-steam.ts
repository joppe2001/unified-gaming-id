import { defineEventHandler, parseCookies, createError } from 'h3';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export default defineEventHandler(async (event) => {
  // Only allow POST requests
  if (event.method !== 'POST') {
    return createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    });
  }
  
  // Get Firebase ID token from cookies to identify the user
  const cookies = parseCookies(event);
  const idToken = cookies.idToken;
  
  if (!idToken) {
    return {
      success: false,
      error: 'Not authenticated'
    };
  }
  
  try {
    // Verify the token and get user
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    // Get Firestore instance
    const db = getFirestore();
    
    // Update user document to remove Steam connection
    await db.collection('users').doc(userId).update({
      'connectedAccounts.steam': null
    });
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error disconnecting Steam account:', error);
    
    // Check if the error is related to Firestore not being enabled
    if (error.message?.includes('PERMISSION_DENIED') && error.message?.includes('Cloud Firestore API has not been used')) {
      return {
        success: false,
        error: 'Firestore API is not enabled'
      };
    }
    
    return {
      success: false,
      error: 'Failed to disconnect Steam account'
    };
  }
}); 