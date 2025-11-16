import { useState, useMemo } from 'react';
import { Download, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserCollection } from '../hooks/useFirestore';
import { COLLECTIONS } from '../lib/firebase';
import type { Sale, Job } from '../types';
import { Button } from '../components/ui/Button';
import { SalesTable } from '../components/sales/SalesTable';
import { SalesChart } from '../components/sales/SalesChart';
import { DateFilter, filterSalesByPeriod, type DateFilterPeriod } from '../components/sales/DateFilter';
import { JobDetail } from '../components/jobs/JobDetail';
import { exportSalesToCSV } from '../utils/export';
import { formatCurrency } from '../utils/calculations';

export function Sales() {
  const { userData } = useAuth();
  const [period, setPeriod] = useState<DateFilterPeriod>('thisMonth');
  const [viewingJob, setViewingJob] = useState<Job | null>(null);

  // Fetch sales and jobs (sans orderBy pour éviter les index)
  const { data: allSalesRaw, loading: salesLoading } = useUserCollection<Sale>(
    COLLECTIONS.SALES,
    userData?.uid
  );

  const { data: jobs, loading: jobsLoading } = useUserCollection<Job>(
    COLLECTIONS.JOBS,
    userData?.uid
  );

  // Tri côté client par date
  const allSales = useMemo(() => {
    return [...allSalesRaw].sort((a, b) => b.date - a.date);
  }, [allSalesRaw]);

  const { data: filaments } = useUserCollection<import('../types').Filament>(
    COLLECTIONS.FILAMENTS,
    userData?.uid
  );

  // Filter sales by period
  const filteredSales = useMemo(
    () => filterSalesByPeriod(allSales, period),
    [allSales, period]
  );

  // Calculate totals
  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.price, 0);
    const count = filteredSales.length;
    const averagePrice = count > 0 ? totalRevenue / count : 0;

    return {
      totalRevenue,
      count,
      averagePrice,
    };
  }, [filteredSales]);

  const loading = salesLoading || jobsLoading;

  function handleViewJob(jobId: string) {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setViewingJob(job);
    }
  }

  function handleExportCSV() {
    const filename = `ventes_${new Date().toISOString().split('T')[0]}.csv`;
    exportSalesToCSV(filteredSales, jobs, filename);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Ventes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Historique et analyse de vos ventes
          </p>
        </div>

        <div className="flex gap-2">
          <DateFilter period={period} onChange={setPeriod} />
          {filteredSales.length > 0 && (
            <Button
              variant="secondary"
              icon={<Download className="w-5 h-5" />}
              onClick={handleExportCSV}
            >
              Exporter CSV
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total ventes</p>
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats.totalRevenue, userData?.currency)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.count} vente{stats.count > 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Nombre de ventes</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.count}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Cette période
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Prix moyen</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats.averagePrice, userData?.currency)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Par vente
          </p>
        </div>
      </div>

      {/* Chart */}
      {allSales.length > 0 && <SalesChart sales={allSales} currency={userData?.currency} />}

      {/* Sales Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      ) : (
        <SalesTable
          sales={filteredSales}
          jobs={jobs}
          onViewJob={handleViewJob}
          currency={userData?.currency}
        />
      )}

      {/* Job Detail Modal */}
      <JobDetail
        isOpen={!!viewingJob}
        onClose={() => setViewingJob(null)}
        job={viewingJob}
        filaments={filaments}
        currency={userData?.currency}
      />
    </div>
  );
}
