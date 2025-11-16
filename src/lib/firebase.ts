// ============================================
// Firebase Configuration
// ============================================
// IMPORTANT: Remplace les valeurs ci-dessous avec ta propre config Firebase
// (récupère-la depuis Console Firebase > Project Settings > Your apps)

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { 
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

//  À REMPLACER avec ta propre config Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);

// Initialize Firestore with persistent cache (nouvelle méthode, pas de dépréciation)
// Cette configuration remplace enableIndexedDbPersistence()
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize Storage
export const storage = getStorage(app);

// Emulators (pour développement local - optionnel)
const USE_EMULATORS = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

if (USE_EMULATORS && typeof window !== 'undefined') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  console.log('🔧 Using Firebase Emulators');
}

// Export collection names as constants (pour éviter typos)
export const COLLECTIONS = {
  USERS: 'users',
  FILAMENTS: 'filaments',
  JOBS: 'jobs',
  SALES: 'sales',
  TRANSACTIONS: 'transactions',
  INVENTORY_TRANSACTIONS: 'inventoryTransactions',
  TEMPLATES: 'templates',
} as const;
