import Papa from 'papaparse';
import type { Sale, Job } from '../types';

/**
 * Export sales data to CSV format
 */
export function exportSalesToCSV(sales: Sale[], jobs: Job[], filename: string = 'ventes.csv') {
  // Create job map for easy lookup
  const jobsMap = new Map(jobs.map((j) => [j.id, j]));

  // Prepare data for CSV
  const csvData = sales.map((sale) => {
    const job = jobsMap.get(sale.jobId);
    const date = new Date(sale.date);

    return {
      'Date': date.toLocaleDateString('fr-FR'),
      'Heure': date.toLocaleTimeString('fr-FR'),
      'Objet': job?.title || 'Objet supprimé',
      'Prix (€)': sale.price.toFixed(2),
      'Notes': sale.notes || '',
    };
  });

  // Convert to CSV
  const csv = Papa.unparse(csvData, {
    delimiter: ',',
    header: true,
  });

  // Download file
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export data to JSON format
 */
export function exportToJSON<T>(data: T[], filename: string = 'export.json') {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
}

/**
 * Helper to trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
