import { defineEventHandler, getQuery, parseCookies, sendRedirect, setCookie } from 'h3';
import axios from 'axios';
import { getFirestore } from 'firebase-admin/firestore';
import { createFirebaseCustomToken } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  // Get runtime config
  const config = useRuntimeConfig();
  
  // Get base URL for redirects and cookie settings
  const baseUrl = config.public.baseUrl;
  
  // Extract domain from baseUrl for cookie settings
  const urlObj = new URL(baseUrl);
  const domain = urlObj.hostname;
  
  const query = getQuery(event);
  const cookies = parseCookies(event);
  const userId = cookies.steam_auth_state;
  
  if (!userId) {
    console.error('Steam auth state cookie not found');
    return sendRedirect(event, `${baseUrl}/dashboard?error=invalid_state`);
  }
  
  try {
    // Steam OpenID response validation
    // Check if the response contains the required OpenID parameters
    const mode = query['openid.mode'];
    const identity = query['openid.identity'];
    const claimedId = query['openid.claimed_id'];
    
    if (mode !== 'id_res' || !identity || !claimedId) {
      throw new Error('Invalid OpenID response');
    }
    
    // Extract Steam ID from claimed_id
    // Format is https://steamcommunity.com/openid/id/76561198012345678
    const steamId = claimedId.toString().split('/').pop();
    
    if (!steamId) {
      throw new Error('Could not extract Steam ID');
    }
    
    // Get Steam user info
    const steamApiKey = config.public.steamApiKey;
    const steamUserResponse = await axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${steamId}`);
    const steamUserData = steamUserResponse.data.response.players[0];
    
    // Create a Firebase custom token for this Steam user
    const customToken = await createFirebaseCustomToken(steamId, {
      personaName: steamUserData.personaname,
      avatarUrl: steamUserData.avatarfull,
      profileUrl: steamUserData.profileurl
    });
    
    // Save to Firestore
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);
    
    // Check if the user document exists
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create the user document if it doesn't exist
      console.log(`Creating new user document for userId: ${userId} with Steam connection`);
      await userRef.set({
        uid: userId,
        createdAt: new Date(),
        connectedAccounts: {
          steam: {
            steamId,
            personaName: steamUserData.personaname,
            avatarUrl: steamUserData.avatarfull,
            profileUrl: steamUserData.profileurl,
            connectedAt: new Date()
          }
        }
      });
    } else {
      // Update the existing user document
      console.log(`Updating existing user document for userId: ${userId} with Steam connection`);
      await userRef.update({
        'connectedAccounts.steam': {
          steamId,
          personaName: steamUserData.personaname,
          avatarUrl: steamUserData.avatarfull,
          profileUrl: steamUserData.profileurl,
          connectedAt: new Date()
        }
      });
    }
    
    // Set the custom token as a cookie with proper settings for Vercel
    setCookie(event, 'firebaseCustomToken', customToken, {
      maxAge: 60 * 5, // 5 minutes
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      // Only set domain for production (not localhost)
      ...(domain !== 'localhost' && { domain })
    });
    
    // Use the full URL for the redirect
    return sendRedirect(event, `${baseUrl}/dashboard?platform=steam&status=connected`);
  } catch (error: any) {
    console.error('Error processing Steam callback:', error);
    
    // Check if the error is related to Firestore not being enabled
    if (error.message?.includes('PERMISSION_DENIED') && error.message?.includes('Cloud Firestore API has not been used')) {
      return sendRedirect(event, `${baseUrl}/dashboard?error=firestore_not_enabled`);
    }
    
    // Use the full URL for the redirect
    return sendRedirect(event, `${baseUrl}/dashboard?error=steam_callback_error`);
  }
}); 