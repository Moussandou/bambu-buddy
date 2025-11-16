import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Job, Filament } from '../types';
import { formatCurrency } from '../utils/calculations';

/**
 * Export jobs to PDF
 */
export function exportJobsToPDF(jobs: Job[], filaments: Filament[], currency: string): void {
  const doc = new jsPDF();
  const filamentsMap = new Map(filaments.map((f) => [f.id, f]));

  // Header
  doc.setFontSize(20);
  doc.text('Bambu Buddy - Rapport d\'impressions', 14, 22);

  doc.setFontSize(10);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

  // Table data
  const tableData = jobs.map((job) => {
    // Calculate cost
    let cost = 0;
    job.filaments.forEach((usage) => {
      const filament = filamentsMap.get(usage.filamentId);
      if (filament) {
        cost += (usage.grams / 1000) * filament.price_per_kg;
      }
    });
    cost *= job.quantity || 1;

    return [
      job.title,
      job.state,
      job.quantity || 1,
      formatCurrency(cost, currency),
      job.salePrice ? formatCurrency(job.salePrice, currency) : '-',
      job.salePrice ? formatCurrency((job.salePrice * (job.quantity || 1)) - cost, currency) : '-',
    ];
  });

  autoTable(doc, {
    startY: 35,
    head: [['Titre', 'Statut', 'Qté', 'Coût', 'Prix', 'Profit']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Save
  doc.save(`bambu-buddy-jobs-${Date.now()}.pdf`);
}

/**
 * Export jobs to Excel
 */
export function exportJobsToExcel(jobs: Job[], filaments: Filament[]): void {
  const filamentsMap = new Map(filaments.map((f) => [f.id, f]));

  const data = jobs.map((job) => {
    // Calculate cost
    let cost = 0;
    job.filaments.forEach((usage) => {
      const filament = filamentsMap.get(usage.filamentId);
      if (filament) {
        cost += (usage.grams / 1000) * filament.price_per_kg;
      }
    });
    cost *= job.quantity || 1;

    const revenue = (job.salePrice || 0) * (job.quantity || 1);
    const profit = revenue - cost;

    return {
      Titre: job.title,
      Description: job.description || '',
      Statut: job.state,
      Quantité: job.quantity || 1,
      'Coût (€)': cost.toFixed(2),
      'Prix vente (€)': job.salePrice?.toFixed(2) || '',
      'Profit (€)': job.salePrice ? profit.toFixed(2) : '',
      'Durée (h)': job.printDuration_hours || '',
      'Date création': new Date(job.createdAt).toLocaleDateString('fr-FR'),
      'Date vente': job.soldAt ? new Date(job.soldAt).toLocaleDateString('fr-FR') : '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Impressions');

  // Auto-size columns
  const maxWidth = 50;
  const colWidths = Object.keys(data[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => String(row[key as keyof typeof row] || '').length)
    );
    return { wch: Math.min(maxLen + 2, maxWidth) };
  });
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `bambu-buddy-jobs-${Date.now()}.xlsx`);
}

/**
 * Export jobs to CSV
 */
export function exportJobsToCSV(jobs: Job[], filaments: Filament[]): void {
  const filamentsMap = new Map(filaments.map((f) => [f.id, f]));

  const data = jobs.map((job) => {
    // Calculate cost
    let cost = 0;
    job.filaments.forEach((usage) => {
      const filament = filamentsMap.get(usage.filamentId);
      if (filament) {
        cost += (usage.grams / 1000) * filament.price_per_kg;
      }
    });
    cost *= job.quantity || 1;

    const revenue = (job.salePrice || 0) * (job.quantity || 1);
    const profit = revenue - cost;

    return {
      Titre: job.title,
      Description: job.description || '',
      Statut: job.state,
      Quantité: job.quantity || 1,
      'Coût (€)': cost.toFixed(2),
      'Prix vente (€)': job.salePrice?.toFixed(2) || '',
      'Profit (€)': job.salePrice ? profit.toFixed(2) : '',
      'Durée (h)': job.printDuration_hours || '',
      'Date création': new Date(job.createdAt).toLocaleDateString('fr-FR'),
      'Date vente': job.soldAt ? new Date(job.soldAt).toLocaleDateString('fr-FR') : '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `bambu-buddy-jobs-${Date.now()}.csv`;
  link.click();
}

/**
 * Export statistics to PDF
 */
export function exportStatisticsToPDF(
  stats: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalPrintTime: number;
    completedJobs: number;
    soldJobs: number;
  },
  currency: string
): void {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(24);
  doc.text('Bambu Buddy', 14, 22);

  doc.setFontSize(16);
  doc.text('Rapport Statistiques', 14, 32);

  doc.setFontSize(10);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 40);

  // Stats
  const statsData = [
    ['Chiffre d\'affaires', formatCurrency(stats.totalRevenue, currency)],
    ['Coûts totaux', formatCurrency(stats.totalCost, currency)],
    ['Profit total', formatCurrency(stats.totalProfit, currency)],
    ['ROI', `${stats.totalCost > 0 ? Math.round((stats.totalProfit / stats.totalCost) * 100) : 0}%`],
    ['Impressions terminées', stats.completedJobs.toString()],
    ['Impressions vendues', stats.soldJobs.toString()],
    ['Temps total impression', `${Math.round(stats.totalPrintTime)} heures`],
    ['Moyenne par impression', stats.completedJobs > 0 ? `${Math.round(stats.totalPrintTime / stats.completedJobs)} heures` : '-'],
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Métrique', 'Valeur']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
    },
  });

  doc.save(`bambu-buddy-stats-${Date.now()}.pdf`);
}
