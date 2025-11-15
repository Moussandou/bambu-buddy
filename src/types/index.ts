// ============================================
// Core Data Models for Bambu Buddy
// ============================================

export interface User {
  uid: string;
  displayName: string;
  email: string;
  currency: string; // "EUR", "USD", etc.
  createdAt: number; // timestamp
  photoURL?: string;
}

export interface Filament {
  id: string;
  userId: string;
  name: string;
  colorHex: string; // e.g., "#ff4500"
  colorName?: string; // e.g., "Orange Vif"
  weightInitial_g: number; // grammes
  weightRemaining_g: number; // grammes
  price_per_kg: number; // prix au kg (EUR, USD, etc.)
  supplier?: string;
  notes?: string;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export type JobState = 'en impression' | 'fini' | 'en vente' | 'vendu';

export interface FilamentUsage {
  filamentId: string;
  grams: number; // grammes utilisés
  filament?: Filament; // populated pour affichage
}

export interface Job {
  id: string;
  userId: string;
  title: string;
  description?: string;
  images: string[]; // URLs Firebase Storage
  filaments: FilamentUsage[]; // tableau multi-filaments
  state: JobState;
  salePrice?: number; // prix de vente (si en vente ou vendu)
  tags?: string[]; // ex: ["support", "déco"]
  printDuration_hours?: number; // durée impression (optionnel)
  quantity?: number; // nombre d'objets à imprimer (défaut: 1)
  printStartedAt?: number; // timestamp début impression (pour calcul progression)
  templateId?: string; // ID du template si créé depuis un template
  createdAt: number;
  updatedAt: number;
  soldAt?: number; // timestamp vente
}

export interface Sale {
  id: string;
  userId: string;
  jobId: string;
  price: number;
  date: number; // timestamp
  notes?: string;
  job?: Job; // populated pour affichage
}

export type TransactionType = 'sale' | 'expense' | 'withdraw' | 'filament_purchase';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // positif = entrée, négatif = sortie
  relatedId?: string; // ex: sales/sid, jobs/jid
  description?: string;
  date: number;
  withdrawn: boolean; // marqué comme retiré du portefeuille
}

export interface InventoryTransaction {
  id: string;
  userId: string;
  filamentId: string;
  type: 'add' | 'consume' | 'adjust';
  grams: number; // positif ou négatif
  relatedJobId?: string;
  notes?: string;
  date: number;
}

export interface Template {
  id: string;
  userId: string;
  name: string;
  description?: string;
  images: string[]; // URLs Firebase Storage
  filaments: FilamentUsage[];
  salePrice?: number;
  tags?: string[];
  printDuration_hours?: number;
  timesUsed: number; // Compteur d'utilisation
  createdAt: number;
  updatedAt: number;
}

// ============================================
// Calculated / Derived Types (pour affichage)
// ============================================

export interface JobWithCost extends Job {
  totalCost: number; // coût total filament
  profit?: number; // bénéfice (salePrice - totalCost)
}

export interface DashboardStats {
  totalSales: number; // somme ventes
  totalCost: number; // somme coûts matière
  netProfit: number; // bénéfice net
  jobsCount: {
    enImpression: number;
    fini: number;
    enVente: number;
    vendu: number;
  };
  filamentStats: {
    totalWeight_g: number;
    totalValue: number; // valeur stock restant
  };
}

export interface FilamentWithUsage extends Filament {
  usagePercentage: number; // (initial - remaining) / initial * 100
  remainingValue: number; // (weightRemaining / 1000) * price_per_kg
}

// ============================================
// UI / Form Types
// ============================================

export interface FilamentFormData {
  name: string;
  colorHex: string;
  colorName?: string;
  weightInitial_g: number;
  price_per_kg: number;
  supplier?: string;
  notes?: string;
}

export interface JobFormData {
  title: string;
  description?: string;
  filaments: FilamentUsage[];
  salePrice?: number;
  tags?: string[];
  printDuration_hours?: number;
  quantity?: number;
}

export interface TemplateFormData {
  name: string;
  description?: string;
  filaments: FilamentUsage[];
  salePrice?: number;
  tags?: string[];
  printDuration_hours?: number;
}

export interface SaleFormData {
  jobId: string;
  price: number;
  notes?: string;
}
