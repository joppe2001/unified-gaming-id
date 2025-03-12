import { defineEventHandler, getQuery, parseCookies, sendRedirect, setCookie } from 'h3';
import axios from 'axios';
import { getFirestore } from 'firebase-admin/firestore';
import { createFirebaseCustomToken } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const cookies = parseCookies(event);
  const userId = cookies.steam_auth_state;
  
  if (!userId) {
    return sendRedirect(event, '/dashboard?error=invalid_state');
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
    const steamApiKey = process.env.STEAM_API_KEY;
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
    
    await userRef.update({
      'connectedAccounts.steam': {
        steamId,
        personaName: steamUserData.personaname,
        avatarUrl: steamUserData.avatarfull,
        profileUrl: steamUserData.profileurl,
        connectedAt: new Date()
      }
    });
    
    // Set the custom token as a cookie
    setCookie(event, 'firebaseCustomToken', customToken, {
      maxAge: 60 * 5, // 5 minutes
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
    
    return sendRedirect(event, '/dashboard?platform=steam&status=connected');
  } catch (error: any) {
    console.error('Error processing Steam callback:', error);
    
    // Check if the error is related to Firestore not being enabled
    if (error.message?.includes('PERMISSION_DENIED') && error.message?.includes('Cloud Firestore API has not been used')) {
      return sendRedirect(event, '/dashboard?error=firestore_not_enabled');
    }
    
    return sendRedirect(event, '/dashboard?error=steam_callback_error');
  }
}); 