export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  connectedAccounts: {
    steam?: {
      steamId: string;
      personaName: string;
      avatarUrl: string;
      profileUrl: string;
      connectedAt: Date;
    };
    // Other platforms will follow this pattern
    epic?: any;
    playstation?: any;
    xbox?: any;
    riot?: any;
  };
} 