import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export default defineEventHandler(async (event) => {
  try {
    // Get the ID token from the cookie
    const idTokenCookie = getCookie(event, 'idToken');
    
    if (!idTokenCookie) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized: You must be logged in to connect your Riot Games account'
      });
    }
    
    // Get the authorization code from the query parameters
    const query = getQuery(event);
    const code = query.code as string;
    
    if (!code) {
      throw createError({
        statusCode: 400,
        message: 'Bad Request: Missing authorization code'
      });
    }
    
    // Verify the ID token
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idTokenCookie);
    const uid = decodedToken.uid;
    
    // Exchange the authorization code for an access token
    // This would typically be done using the Riot Games API
    // For now, we'll just simulate this by storing the connection info
    
    // Get Firestore instance
    const db = getFirestore();
    
    // Update the user profile with the Riot Games account info
    await db.collection('users').doc(uid).update({
      'connectedAccounts.riot': {
        gameName: 'RiotPlayer', // This would come from the Riot API
        tagLine: '1234', // This would come from the Riot API
        connectedAt: FieldValue.serverTimestamp()
      }
    });
    
    // Redirect back to the dashboard
    return sendRedirect(event, '/dashboard');
  } catch (error: any) {
    console.error('Error connecting Riot Games account:', error);
    
    // Redirect to the dashboard with an error message
    return sendRedirect(event, '/dashboard?error=' + encodeURIComponent(error.message || 'Failed to connect Riot Games account'));
  }
}); 