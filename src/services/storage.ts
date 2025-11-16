// ============================================
// Storage Service (Firebase Storage)
// ============================================

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase';

/**
 * Upload une image vers Firebase Storage
 * @param file - Fichier image à uploader
 * @param path - Chemin dans Storage (ex: "jobs/userId/jobId/image.jpg")
 * @returns URL publique de l'image uploadée
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
}

/**
 * Upload plusieurs images
 * @param files - Tableau de fichiers
 * @param basePath - Chemin de base (ex: "jobs/userId/jobId")
 * @returns Tableau d'URLs
 */
export async function uploadImages(files: File[], basePath: string): Promise<string[]> {
  const uploadPromises = files.map((file, index) => {
    const filename = `${Date.now()}_${index}_${file.name}`;
    const path = `${basePath}/${filename}`;
    return uploadImage(file, path);
  });

  return Promise.all(uploadPromises);
}

/**
 * Supprime une image de Storage
 * @param url - URL de l'image à supprimer
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    const imageRef = ref(storage, url);
    await deleteObject(imageRef);
  } catch {
    // Ignore si l'image n'existe pas
  }
}

/**
 * Supprime plusieurs images
 * @param urls - Tableau d'URLs à supprimer
 */
export async function deleteImages(urls: string[]): Promise<void> {
  await Promise.all(urls.map(deleteImage));
}

/**
 * Valide qu'un fichier est une image
 */
export function isValidImage(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return false;
  }

  if (file.size > maxSize) {
    return false;
  }

  return true;
}

/**
 * Valide un tableau de fichiers
 */
export function validateImages(files: File[]): { valid: boolean; error?: string } {
  if (files.length === 0) {
    return { valid: false, error: 'Aucune image sélectionnée' };
  }

  if (files.length > 5) {
    return { valid: false, error: 'Maximum 5 images' };
  }

  for (const file of files) {
    if (!isValidImage(file)) {
      return {
        valid: false,
        error: `${file.name}: format invalide ou taille > 5MB`,
      };
    }
  }

  return { valid: true };
}
