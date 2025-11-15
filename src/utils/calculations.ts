// ============================================
// Calculation Utilities
// ============================================

import type { Job, Filament, FilamentUsage, JobWithCost } from '../types';

/**
 * Calcule le coût d'un filament utilisé
 * Formule: (grammes / 1000) × prix_par_kg
 *
 * Exemple: 33g à 16€/kg
 * - 33 / 1000 = 0.033
 * - 0.033 × 16 = 0.528
 * - Arrondi: 0.53€
 */
export function calculateFilamentCost(
  grams: number,
  pricePerKg: number
): number {
  const kilograms = grams / 1000;
  const cost = kilograms * pricePerKg;
  return Math.round(cost * 100) / 100; // arrondi à 2 décimales
}

/**
 * Calcule le coût total d'un job (somme des filaments utilisés)
 */
export function calculateJobTotalCost(
  filaments: FilamentUsage[],
  filamentsData: Map<string, Filament>
): number {
  return filaments.reduce((total, usage) => {
    const filament = filamentsData.get(usage.filamentId);
    if (!filament) return total;

    const cost = calculateFilamentCost(usage.grams, filament.price_per_kg);
    return total + cost;
  }, 0);
}

/**
 * Calcule le profit d'un job (prix de vente - coût)
 */
export function calculateJobProfit(
  salePrice: number | undefined,
  totalCost: number
): number | undefined {
  if (!salePrice) return undefined;
  return Math.round((salePrice - totalCost) * 100) / 100;
}

/**
 * Enrichit un job avec ses données de coût et profit
 */
export function enrichJobWithCost(
  job: Job,
  filamentsData: Map<string, Filament>
): JobWithCost {
  const totalCost = calculateJobTotalCost(job.filaments, filamentsData);
  const profit = calculateJobProfit(job.salePrice, totalCost);

  return {
    ...job,
    totalCost,
    profit,
  };
}

/**
 * Calcule le pourcentage d'utilisation d'un filament
 */
export function calculateFilamentUsagePercentage(
  weightInitial: number,
  weightRemaining: number
): number {
  if (weightInitial === 0) return 0;
  const used = weightInitial - weightRemaining;
  return Math.round((used / weightInitial) * 100);
}

/**
 * Calcule la valeur restante d'un filament
 */
export function calculateFilamentRemainingValue(
  weightRemaining: number,
  pricePerKg: number
): number {
  return Math.round((weightRemaining / 1000) * pricePerKg * 100) / 100;
}

/**
 * Formate un montant en devise
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR'
): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Formate un poids en grammes avec unité
 */
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${grams} g`;
}

/**
 * Formate une durée en heures
 */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
