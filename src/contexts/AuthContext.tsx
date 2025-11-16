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
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '../lib/firebase';
import type { User } from '../types';

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

    // Mettre à jour le profil Firebase Auth
    await updateProfile(result.user, { displayName });

    // Créer le profil Firestore directement avec le displayName fourni
    const userRef = doc(db, COLLECTIONS.USERS, result.user.uid);
    const newUser: User = {
      uid: result.user.uid,
      email: result.user.email || '',
      displayName: displayName,
      currency: 'EUR',
      createdAt: Date.now(),
      photoURL: result.user.photoURL || undefined,
    };

    await setDoc(userRef, newUser);
    setUserData(newUser);
  }

  // Sign in avec Google
  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const userData = await getUserData(result.user);
      setUserData(userData);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/popup-blocked') {
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
      setCurrentUser(user);

      if (user) {
        try {
          const userData = await getUserData(user);
          setUserData(userData);
        } catch (error) {
          // Error fetching user data
          setUserData(null);
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
