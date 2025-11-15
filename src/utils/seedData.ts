// ============================================
// Script de données d'exemple (seed)
// ============================================
// Utilise ce fichier pour remplir ta base avec des données de test

import { collection, addDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import type { Job } from '../types';

/**
 * Données d'exemple de filaments
 */
export const exampleFilaments = [
  {
    name: 'PLA Blanc',
    colorHex: '#ffffff',
    colorName: 'Blanc',
    weightInitial_g: 1000,
    weightRemaining_g: 750,
    price_per_kg: 15,
    supplier: 'Bambu Lab',
    notes: 'Filament de base, excellente finition',
  },
  {
    name: 'PLA Rouge',
    colorHex: '#ef4444',
    colorName: 'Rouge',
    weightInitial_g: 1000,
    weightRemaining_g: 890,
    price_per_kg: 16,
    supplier: 'Polymaker',
  },
  {
    name: 'PLA Bleu',
    colorHex: '#3b82f6',
    colorName: 'Bleu',
    weightInitial_g: 1000,
    weightRemaining_g: 450,
    price_per_kg: 15.5,
    supplier: 'Bambu Lab',
    notes: 'Stock faible',
  },
  {
    name: 'PETG Transparent',
    colorHex: '#e0e0e0',
    colorName: 'Transparent',
    weightInitial_g: 1000,
    weightRemaining_g: 980,
    price_per_kg: 18,
    supplier: 'Prusament',
  },
  {
    name: 'PLA Noir',
    colorHex: '#1f2937',
    colorName: 'Noir',
    weightInitial_g: 1000,
    weightRemaining_g: 200,
    price_per_kg: 14.5,
    supplier: 'Eryone',
    notes: 'Commander bientôt',
  },
];

/**
 * Génère des exemples de jobs
 */
export function generateExampleJobs(filamentIds: string[]): Partial<Job>[] {
  return [
    {
      title: 'Support téléphone',
      description: 'Support pour iPhone, design minimaliste',
      filaments: [
        { filamentId: filamentIds[0], grams: 45 }, // Blanc
      ],
      state: 'vendu',
      salePrice: 8,
      tags: ['accessoire', 'pratique'],
      printDuration_hours: 2.5,
      soldAt: Date.now() - 86400000 * 2, // vendu il y a 2 jours
    },
    {
      title: 'Pot de fleur décoratif',
      description: 'Petit pot géométrique',
      filaments: [
        { filamentId: filamentIds[2], grams: 120 }, // Bleu
      ],
      state: 'vendu',
      salePrice: 12,
      tags: ['déco', 'jardin'],
      printDuration_hours: 5,
      soldAt: Date.now() - 86400000 * 5,
    },
    {
      title: 'Porte-clés personnalisé',
      description: 'Porte-clés avec initiales',
      filaments: [
        { filamentId: filamentIds[1], grams: 12 }, // Rouge
      ],
      state: 'en vente',
      salePrice: 5,
      tags: ['cadeau', 'petit'],
      printDuration_hours: 0.5,
    },
    {
      title: 'Support Switch Joy-Con',
      description: 'Support pour manettes Nintendo Switch',
      filaments: [
        { filamentId: filamentIds[4], grams: 80 }, // Noir
        { filamentId: filamentIds[1], grams: 15 }, // Rouge (détails)
      ],
      state: 'fini',
      tags: ['gaming', 'accessoire'],
      printDuration_hours: 4,
    },
    {
      title: 'Organisateur bureau',
      description: 'Organisateur multifonction pour stylos et fournitures',
      filaments: [
        { filamentId: filamentIds[0], grams: 180 },
      ],
      state: 'en impression',
      tags: ['bureau', 'organisation'],
      printDuration_hours: 8,
    },
  ];
}

/**
 * Seed la base de données avec des données d'exemple
 */
export async function seedDatabase(userId: string): Promise<void> {
  const now = Date.now();

  try {
    // 1. Créer les filaments
    console.log('Création des filaments...');
    const filamentIds: string[] = [];

    for (const filamentData of exampleFilaments) {
      const docRef = await addDoc(collection(db, COLLECTIONS.FILAMENTS), {
        userId,
        ...filamentData,
        createdAt: now,
        updatedAt: now,
      });
      filamentIds.push(docRef.id);

      // Log inventory transaction
      await addDoc(collection(db, COLLECTIONS.INVENTORY_TRANSACTIONS), {
        userId,
        filamentId: docRef.id,
        type: 'add',
        grams: filamentData.weightInitial_g,
        notes: 'Stock initial (seed)',
        date: now,
      });
    }

    console.log(`✓ ${filamentIds.length} filaments créés`);

    // 2. Créer les jobs
    console.log('Création des impressions...');
    const jobs = generateExampleJobs(filamentIds);
    const jobIds: string[] = [];

    for (const jobData of jobs) {
      const docRef = await addDoc(collection(db, COLLECTIONS.JOBS), {
        userId,
        images: [],
        ...jobData,
        createdAt: now - Math.random() * 86400000 * 10, // créés dans les 10 derniers jours
        updatedAt: now,
      });
      jobIds.push(docRef.id);
    }

    console.log(`✓ ${jobIds.length} impressions créées`);

    // 3. Créer les ventes (pour les jobs vendus)
    console.log('Création des ventes...');
    let salesCount = 0;

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      if (job.state === 'vendu' && job.salePrice && job.soldAt) {
        const saleRef = await addDoc(collection(db, COLLECTIONS.SALES), {
          userId,
          jobId: jobIds[i],
          price: job.salePrice,
          date: job.soldAt,
          notes: 'Vente initiale (seed)',
        });

        // Créer transaction
        await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
          userId,
          type: 'sale',
          amount: job.salePrice,
          relatedId: saleRef.id,
          description: `Vente: ${job.title}`,
          date: job.soldAt,
          withdrawn: false,
        });

        salesCount++;
      }
    }

    console.log(`✓ ${salesCount} ventes créées`);
    console.log('\n✅ Base de données remplie avec succès !');
    console.log(`
Résumé:
- ${filamentIds.length} filaments
- ${jobIds.length} impressions
- ${salesCount} ventes
    `);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  }
}

/**
 * Fonction helper pour appeler depuis la console navigateur
 * Usage: Dans la console, après connexion, tape:
 * window.seedData()
 */
if (typeof window !== 'undefined') {
  (window as any).seedData = async () => {
    const userId = prompt('Entre ton userId (récupéré depuis AuthContext):');
    if (!userId) {
      console.error('userId requis');
      return;
    }
    await seedDatabase(userId);
  };
}
