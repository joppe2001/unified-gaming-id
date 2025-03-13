import { initializeApp, getApps, cert } from 'firebase-admin/app';

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig();
  
  // Initialize Firebase Admin if it hasn't been initialized yet
  if (getApps().length === 0) {
    // Check if we have the required environment variables
    if (!config.firebaseAdminProjectId || !config.firebaseAdminClientEmail || !config.firebaseAdminPrivateKey) {
      console.error('Firebase Admin SDK is not properly configured. Please check your environment variables.');
      return;
    }
    
    try {
      // Initialize the app with credentials
      initializeApp({
        credential: cert({
          projectId: config.firebaseAdminProjectId,
          clientEmail: config.firebaseAdminClientEmail,
          // The private key comes as a string with "\n" characters
          // We need to replace them with actual newlines
          privateKey: config.firebaseAdminPrivateKey.replace(/\\n/g, '\n'),
        })
      });
      
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
    }
  }
}); 