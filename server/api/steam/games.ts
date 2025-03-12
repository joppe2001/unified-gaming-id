import { defineEventHandler } from 'h3';
import axios from 'axios';
import { getFirebaseUser } from '~/server/utils/auth';
import { getFirestore } from 'firebase-admin/firestore';

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const user = await getFirebaseUser(event);
    if (!user) {
      return { statusCode: 401, body: { error: 'Unauthorized' } };
    }
    
    // Get Steam ID from Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      return { statusCode: 404, body: { error: 'User not found' } };
    }
    
    const userData = userDoc.data();
    const steamId = userData?.connectedAccounts?.steam?.steamId;
    
    if (!steamId) {
      return { statusCode: 400, body: { error: 'Steam account not connected' } };
    }
    
    // Call Steam API
    const steamApiKey = process.env.STEAM_API_KEY;
    const response = await axios.get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${steamApiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`);
    
    return {
      games: response.data.response.games || []
    };
  } catch (error) {
    console.error('Error fetching Steam games:', error);
    return { statusCode: 500, body: { error: 'Internal server error' } };
  }
}); 