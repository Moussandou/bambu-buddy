// ============================================
// Jobs Service (Firebase CRUD)
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
import type { Job, JobFormData, JobState } from '../types';
import { consumeFilament } from './filaments';

/**
 * Récupère tous les jobs de l'utilisateur
 */
export async function getUserJobs(userId: string): Promise<Job[]> {
  const q = query(
    collection(db, COLLECTIONS.JOBS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Job[];
}

/**
 * Récupère les jobs par état
 */
export async function getJobsByState(
  userId: string,
  state: JobState
): Promise<Job[]> {
  const q = query(
    collection(db, COLLECTIONS.JOBS),
    where('userId', '==', userId),
    where('state', '==', state),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Job[];
}

/**
 * Récupère un job par ID
 */
export async function getJob(id: string): Promise<Job | null> {
  const docRef = doc(db, COLLECTIONS.JOBS, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Job;
}

/**
 * Crée un nouveau job
 */
export async function createJob(
  userId: string,
  data: JobFormData,
  autoConsumeFilament: boolean = false
): Promise<string> {
  const now = Date.now();

  const job: Omit<Job, 'id'> = {
    userId,
    title: data.title,
    description: data.description,
    images: [],
    filaments: data.filaments,
    state: 'en impression',
    salePrice: data.salePrice,
    tags: data.tags || [],
    printDuration_hours: data.printDuration_hours,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.JOBS), job);

  // Consommer automatiquement le filament si demandé
  if (autoConsumeFilament) {
    for (const usage of data.filaments) {
      await consumeFilament(userId, usage.filamentId, usage.grams, docRef.id);
    }
  }

  return docRef.id;
}

/**
 * Met à jour un job
 */
export async function updateJob(
  id: string,
  data: Partial<Job>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.JOBS, id);

  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now(),
  });
}

/**
 * Change l'état d'un job
 */
export async function updateJobState(
  id: string,
  state: JobState
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.JOBS, id);

  const updates: any = {
    state,
    updatedAt: Date.now(),
  };

  // Si vendu, ajoute timestamp
  if (state === 'vendu') {
    updates.soldAt = Date.now();
  }

  await updateDoc(docRef, updates);
}

/**
 * Supprime un job
 */
export async function deleteJob(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.JOBS, id);
  await deleteDoc(docRef);
}

/**
 * Marque un job comme vendu et crée la vente
 */
export async function markJobAsSold(
  jobId: string,
  salePrice: number,
  notes?: string
): Promise<string> {
  const jobDoc = await getJob(jobId);
  if (!jobDoc) throw new Error('Job not found');

  const now = Date.now();
  const batch = writeBatch(db);

  // Update job state
  const jobRef = doc(db, COLLECTIONS.JOBS, jobId);
  batch.update(jobRef, {
    state: 'vendu',
    salePrice,
    soldAt: now,
    updatedAt: now,
  });

  // Create sale record
  const saleRef = doc(collection(db, COLLECTIONS.SALES));
  batch.set(saleRef, {
    userId: jobDoc.userId,
    jobId,
    price: salePrice,
    date: now,
    notes: notes || '',
  });

  // Create transaction
  const transRef = doc(collection(db, COLLECTIONS.TRANSACTIONS));
  batch.set(transRef, {
    userId: jobDoc.userId,
    type: 'sale',
    amount: salePrice,
    relatedId: saleRef.id,
    description: `Vente: ${jobDoc.title}`,
    date: now,
    withdrawn: false,
  });

  await batch.commit();
  return saleRef.id;
}
