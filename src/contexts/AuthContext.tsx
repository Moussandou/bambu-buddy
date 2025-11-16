import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type {
  User as FirebaseUser,
} from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '../lib/firebase';
import type { User } from '../types';
import { startOAuthFlow, isTauriEnvironment } from '../services/oauth';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Récupère ou crée le profil utilisateur dans Firestore
  async function getUserData(firebaseUser: FirebaseUser): Promise<User> {
    const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as User;
    }

    // Crée le profil si première connexion
    const newUser: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || 'Utilisateur',
      currency: 'EUR',
      createdAt: Date.now(),
      photoURL: firebaseUser.photoURL || undefined,
    };

    await setDoc(userRef, newUser);
    return newUser;
  }

  // Sign in
  async function signIn(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const userData = await getUserData(result.user);
    setUserData(userData);
  }

  // Sign up
  async function signUp(email: string, password: string, displayName: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    const userData = await getUserData(result.user);
    setUserData(userData);
  }

  // Sign in avec Google - adapté pour web et Tauri
  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const isTauri = isTauriEnvironment();

    try {
      if (isTauri) {
        // Dans Tauri, ouvrir le navigateur système pour l'OAuth
        console.log('Starting OAuth flow in system browser...');
        const idToken = await startOAuthFlow();

        // Créer les credentials avec le token ID reçu
        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(auth, credential);

        const userData = await getUserData(result.user);
        setUserData(userData);
      } else {
        // En web, utiliser popup (fonctionne parfaitement)
        const result = await signInWithPopup(auth, provider);
        const userData = await getUserData(result.user);
        setUserData(userData);
      }
    } catch (error: any) {
      console.error('Erreur Google sign-in:', error);
      if (error?.code === 'auth/popup-blocked') {
        throw new Error('Popup bloquée par le navigateur. Autorisez les popups pour ce site.');
      }
      throw error;
    }
  }

  // Sign out
  async function signOut() {
    await firebaseSignOut(auth);
    setUserData(null);
  }

  // Reset password (fonctionne aussi pour ajouter un mot de passe à un compte Google)
  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  // Observer l'état d'auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);

      if (user) {
        try {
          const userData = await getUserData(user);
          setUserData(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
