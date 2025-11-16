import { useEffect, useState } from 'react';
import type {
  QueryConstraint,
} from 'firebase/firestore';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Hook pour écouter une collection Firestore en temps réel
 */
export function useFirestoreCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionName) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, collectionName), ...constraints);

    console.log('[useFirestore] Setting up listener for:', collectionName);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('[useFirestore] Snapshot received for:', collectionName, 'count:', snapshot.docs.length);
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => {
      console.log('[useFirestore] Cleaning up listener for:', collectionName);
      unsubscribe();
    };
  }, [collectionName]);

  return { data, loading, error };
}

/**
 * Hook spécifique pour récupérer les données d'un utilisateur
 */
export function useUserCollection<T>(
  collectionName: string,
  userId: string | undefined,
  additionalConstraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionName || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const constraints = [where('userId', '==', userId), ...additionalConstraints];
    const q = query(collection(db, collectionName), ...constraints);

    console.log('[useUserCollection] Setting up listener for:', collectionName, 'userId:', userId);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('[useUserCollection] Snapshot received for:', collectionName, 'count:', snapshot.docs.length);
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => {
      console.log('[useUserCollection] Cleaning up listener for:', collectionName);
      unsubscribe();
    };
  }, [collectionName, userId]);

  return { data, loading, error };
}
