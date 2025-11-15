import { useMemo } from 'react';
import { Eye, TrendingUp, TrendingDown } from 'lucide-react';
import type { Sale, Job } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { formatDate } from '../../lib/utils';

interface SalesTableProps {
  sales: Sale[];
  jobs: Job[];
  onViewJob: (jobId: string) => void;
  currency?: string;
}

interface SaleWithJob extends Sale {
  job?: Job;
  profit?: number;
}

export function SalesTable({ sales, jobs, onViewJob, currency = 'EUR' }: SalesTableProps) {
  // Combine sales with job data and calculate profit
  const salesWithDetails = useMemo(() => {
    const jobsMap = new Map(jobs.map((j) => [j.id, j]));

    return sales.map((sale) => {
      const job = jobsMap.get(sale.jobId);
      const profit = job && sale.price ? sale.price - (job.filaments.reduce((acc) => acc, 0)) : undefined;

      return {
        ...sale,
        job,
        profit,
      } as SaleWithJob;
    });
  }, [sales, jobs]);

  if (sales.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
        <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Aucune vente pour le moment</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Objet
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Profit
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {salesWithDetails.map((sale) => (
              <tr
                key={sale.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatDate(sale.date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    {sale.job?.images?.[0] && (
                      <img
                        src={sale.job.images[0]}
                        alt={sale.job.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{sale.job?.title || 'Objet supprimé'}</p>
                      {sale.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{sale.notes}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(sale.price, currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {sale.profit !== undefined ? (
                    <div className="flex items-center justify-end gap-1">
                      {sale.profit >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                      <span
                        className={`font-semibold ${
                          sale.profit >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {formatCurrency(sale.profit, currency)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {sale.job && (
                    <button
                      onClick={() => onViewJob(sale.jobId)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Voir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
