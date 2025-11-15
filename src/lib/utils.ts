// ============================================
// Utility Functions
// ============================================

import type { Job } from '../types';

/**
 * Calculate print progress percentage based on time elapsed
 * @param job - The job to calculate progress for
 * @returns Progress percentage (0-100), or null if not applicable
 */
export function calculatePrintProgress(job: Job): number | null {
  // Only calculate for jobs in "en impression" state
  if (job.state !== 'en impression') return null;

  // Need both printStartedAt and printDuration_hours
  if (!job.printStartedAt || !job.printDuration_hours) return null;

  const now = Date.now();
  const elapsed = now - job.printStartedAt;
  const totalDuration = job.printDuration_hours * 60 * 60 * 1000; // Convert hours to milliseconds

  const progress = Math.min(100, (elapsed / totalDuration) * 100);

  return Math.round(progress);
}

/**
 * Format duration in hours to human-readable format
 * @param hours - Duration in hours
 * @returns Formatted string (e.g., "2h 30m" or "45m")
 */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }

  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (m === 0) {
    return `${h}h`;
  }

  return `${h}h ${m}m`;
}

/**
 * Format timestamp to date string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format currency
 * @param amount - Amount to format
 * @param currency - Currency code (EUR, USD, etc.)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
}
