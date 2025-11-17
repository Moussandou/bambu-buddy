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

// Validation et configuration Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Vérifier que toutes les variables sont définies
const missingVars = Object.entries(firebaseConfig)
  .filter(([, value]) => !value || value === '')
  .map(([key]) => `VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);

if (missingVars.length > 0 && import.meta.env.MODE === 'production') {
  throw new Error(
    `Missing Firebase configuration. Please set the following environment variables:\n${missingVars.join('\n')}\n\nCopy .env.example to .env.local and fill in your Firebase credentials.`
  );
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);

// Initialize Firestore with persistent cache (nouvelle méthode, pas de dépréciation)
// Cette configuration remplace enableIndexedDbPersistence()
// Désactiver le cache persistent dans Tauri pour éviter les problèmes
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

export const db = isTauri
  ? initializeFirestore(app, {}) // Pas de cache persistent dans Tauri
  : initializeFirestore(app, {
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
