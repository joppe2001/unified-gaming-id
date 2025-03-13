import { defineEventHandler, parseCookies, setCookie, sendRedirect } from 'h3';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export default defineEventHandler(async (event) => {
  // Get runtime config to access the base URL
  const config = useRuntimeConfig();
  
  // Define base URL for redirects - use the runtime config value
  const baseUrl = config.public.baseUrl;
  
  // Redirect URL back to our app after authentication
  const redirectUri = `${baseUrl}/api/steam-callback`;
  
  // Get Firebase ID token from cookies to identify the user
  const cookies = parseCookies(event);
  const idToken = cookies.idToken;
  
  if (!idToken) {
    return sendRedirect(event, '/login?error=not_authenticated');
  }
  
  try {
    // Verify the token and get user
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    // Store userId in cookie for retrieval in callback
    setCookie(event, 'steam_auth_state', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10 // 10 minutes
    });
    
    // Use a simpler approach for Steam OpenID
    // Steam uses a specific OpenID 2.0 flow that's simpler to implement directly
    const realm = baseUrl; // Use the base URL as realm
    const steamLoginUrl = new URL('https://steamcommunity.com/openid/login');
    steamLoginUrl.searchParams.set('openid.ns', 'http://specs.openid.net/auth/2.0');
    steamLoginUrl.searchParams.set('openid.mode', 'checkid_setup');
    steamLoginUrl.searchParams.set('openid.return_to', redirectUri);
    steamLoginUrl.searchParams.set('openid.realm', realm);
    steamLoginUrl.searchParams.set('openid.identity', 'http://specs.openid.net/auth/2.0/identifier_select');
    steamLoginUrl.searchParams.set('openid.claimed_id', 'http://specs.openid.net/auth/2.0/identifier_select');
    
    return sendRedirect(event, steamLoginUrl.toString());
  } catch (error: any) {
    console.error('Error initiating Steam auth:', error);
    
    // Check if the error is related to Firestore not being enabled
    if (error.message?.includes('PERMISSION_DENIED') && error.message?.includes('Cloud Firestore API has not been used')) {
      return sendRedirect(event, '/dashboard?error=firestore_not_enabled');
    }
    
    return sendRedirect(event, '/dashboard?error=steam_auth_failed');
  }
}); 