// ============================================
// Templates Service (Firebase CRUD)
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
  increment,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import type { Template, TemplateFormData } from '../types';
import { deleteImages } from './storage';

/**
 * Récupère tous les templates de l'utilisateur
 */
export async function getUserTemplates(userId: string): Promise<Template[]> {
  const q = query(
    collection(db, COLLECTIONS.TEMPLATES),
    where('userId', '==', userId),
    orderBy('timesUsed', 'desc') // Tri par popularité
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Template[];
}

/**
 * Récupère un template par ID
 */
export async function getTemplate(id: string): Promise<Template | null> {
  const docRef = doc(db, COLLECTIONS.TEMPLATES, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Template;
}

/**
 * Crée un nouveau template
 */
export async function createTemplate(
  userId: string,
  data: TemplateFormData,
  imageUrls: string[] = []
): Promise<string> {
  const now = Date.now();

  const template: Omit<Template, 'id'> = {
    userId,
    ...data,
    images: imageUrls,
    timesUsed: 0,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.TEMPLATES), template);
  return docRef.id;
}

/**
 * Met à jour un template
 */
export async function updateTemplate(
  id: string,
  data: Partial<TemplateFormData>,
  imageUrls?: string[]
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.TEMPLATES, id);

  const updateData: any = {
    ...data,
    updatedAt: Date.now(),
  };

  if (imageUrls !== undefined) {
    updateData.images = imageUrls;
  }

  await updateDoc(docRef, updateData);
}

/**
 * Supprime un template (et ses images)
 */
export async function deleteTemplate(id: string): Promise<void> {
  // Récupère le template pour supprimer ses images
  const template = await getTemplate(id);

  if (template?.images && template.images.length > 0) {
    await deleteImages(template.images);
  }

  const docRef = doc(db, COLLECTIONS.TEMPLATES, id);
  await deleteDoc(docRef);
}

/**
 * Incrémente le compteur d'utilisation d'un template
 */
export async function incrementTemplateUsage(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.TEMPLATES, id);
  await updateDoc(docRef, {
    timesUsed: increment(1),
  });
}
