// ============================================
// Filaments Service (Firebase CRUD)
// ============================================

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import type { Filament, FilamentFormData, InventoryTransaction } from '../types';

/**
 * Récupère tous les filaments de l'utilisateur
 */
export async function getUserFilaments(userId: string): Promise<Filament[]> {
  const q = query(
    collection(db, COLLECTIONS.FILAMENTS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Filament[];
}

/**
 * Récupère un filament par ID
 */
export async function getFilament(id: string): Promise<Filament | null> {
  const docRef = doc(db, COLLECTIONS.FILAMENTS, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Filament;
}

/**
 * Crée un nouveau filament
 */
export async function createFilament(
  userId: string,
  data: FilamentFormData
): Promise<string> {
  const now = Date.now();

  const filament = {
    userId,
    ...data,
    weightRemaining_g: data.weightInitial_g, // au départ, tout le stock est disponible
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.FILAMENTS), filament);

  // Log la transaction d'inventaire (ajout initial)
  await addDoc(collection(db, COLLECTIONS.INVENTORY_TRANSACTIONS), {
    userId,
    filamentId: docRef.id,
    type: 'add',
    grams: data.weightInitial_g,
    notes: 'Stock initial',
    date: now,
  });

  return docRef.id;
}

/**
 * Met à jour un filament
 */
export async function updateFilament(
  id: string,
  data: Partial<FilamentFormData>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.FILAMENTS, id);

  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now(),
  });
}

/**
 * Supprime un filament
 */
export async function deleteFilament(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.FILAMENTS, id);
  await deleteDoc(docRef);
}

/**
 * Consomme du filament (réduit le poids restant)
 */
export async function consumeFilament(
  userId: string,
  filamentId: string,
  grams: number,
  relatedJobId?: string
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.FILAMENTS, filamentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Filament not found');
  }

  const filament = docSnap.data() as Filament;
  const newRemaining = Math.max(0, filament.weightRemaining_g - grams);

  const batch = writeBatch(db);

  // Update filament
  batch.update(docRef, {
    weightRemaining_g: newRemaining,
    updatedAt: Date.now(),
  });

  // Log inventory transaction
  const invTransRef = doc(collection(db, COLLECTIONS.INVENTORY_TRANSACTIONS));
  const invTransaction: Omit<InventoryTransaction, 'id'> = {
    userId,
    filamentId,
    type: 'consume',
    grams: -grams, // négatif pour consommation
    date: Date.now(),
  };
  if (relatedJobId) {
    invTransaction.relatedJobId = relatedJobId;
  }
  batch.set(invTransRef, invTransaction);

  await batch.commit();
}

/**
 * Ajoute du filament (augmente le poids restant)
 */
export async function addFilament(
  userId: string,
  filamentId: string,
  grams: number,
  notes?: string
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.FILAMENTS, filamentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Filament not found');
  }

  const filament = docSnap.data() as Filament;
  const newRemaining = filament.weightRemaining_g + grams;
  const newInitial = Math.max(filament.weightInitial_g, newRemaining);

  const batch = writeBatch(db);

  // Update filament
  batch.update(docRef, {
    weightRemaining_g: newRemaining,
    weightInitial_g: newInitial, // ajuste l'initial si on dépasse
    updatedAt: Date.now(),
  });

  // Log inventory transaction
  const invTransRef = doc(collection(db, COLLECTIONS.INVENTORY_TRANSACTIONS));
  const invTransaction: Omit<InventoryTransaction, 'id'> = {
    userId,
    filamentId,
    type: 'add',
    grams,
    date: Date.now(),
  };
  if (notes) {
    invTransaction.notes = notes;
  }
  batch.set(invTransRef, invTransaction);

  await batch.commit();
}

/**
 * Récupère l'historique d'inventaire d'un filament
 */
export async function getFilamentHistory(
  filamentId: string
): Promise<InventoryTransaction[]> {
  const q = query(
    collection(db, COLLECTIONS.INVENTORY_TRANSACTIONS),
    where('filamentId', '==', filamentId),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InventoryTransaction[];
}
