import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Printer, TrendingUp, Wallet } from 'lucide-react';
import { orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useUserCollection } from '../hooks/useFirestore';
import { COLLECTIONS } from '../lib/firebase';
import type { Job, Filament, Sale } from '../types';
import { KPICard } from '../components/ui/KPICard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { JobStateBadge, FilamentBadge } from '../components/ui/Badge';
import { formatCurrency, formatWeight } from '../utils/calculations';
import { enrichJobWithCost } from '../utils/calculations';

export function Dashboard() {
  const { userData } = useAuth();
  const navigate = useNavigate();

  // Récupère les données en temps réel
  const { data: jobs } = useUserCollection<Job>(
    COLLECTIONS.JOBS,
    userData?.uid,
    [orderBy('createdAt', 'desc')]
  );

  const { data: filaments } = useUserCollection<Filament>(
    COLLECTIONS.FILAMENTS,
    userData?.uid
  );

  const { data: sales } = useUserCollection<Sale>(
    COLLECTIONS.SALES,
    userData?.uid,
    [orderBy('date', 'desc')]
  );

  // Calculs des KPIs
  const stats = useMemo(() => {
    const filamentsMap = new Map(filaments.map((f) => [f.id, f]));

    // Enrichir jobs avec coûts
    const enrichedJobs = jobs.map((job) => enrichJobWithCost(job, filamentsMap));

    // Total ventes
    const totalSales = sales.reduce((sum, sale) => sum + sale.price, 0);

    // Total coûts (jobs vendus uniquement)
    const soldJobs = enrichedJobs.filter((j) => j.state === 'vendu');
    const totalCost = soldJobs.reduce((sum, job) => sum + job.totalCost, 0);

    // Bénéfice net
    const netProfit = totalSales - totalCost;

    // Comptage par état
    const jobsCount = {
      enImpression: jobs.filter((j) => j.state === 'en impression').length,
      fini: jobs.filter((j) => j.state === 'fini').length,
      enVente: jobs.filter((j) => j.state === 'en vente').length,
      vendu: jobs.filter((j) => j.state === 'vendu').length,
    };

    // Stock filaments
    const totalFilamentWeight = filaments.reduce(
      (sum, f) => sum + f.weightRemaining_g,
      0
    );

    const totalFilamentValue = filaments.reduce(
      (sum, f) => sum + (f.weightRemaining_g / 1000) * f.price_per_kg,
      0
    );

    return {
      totalSales,
      totalCost,
      netProfit,
      jobsCount,
      totalFilamentWeight,
      totalFilamentValue,
    };
  }, [jobs, filaments, sales]);

  const recentJobs = jobs.slice(0, 5);
  const lowStockFilaments = filaments
    .filter((f) => {
      const percentage = ((f.weightInitial_g - f.weightRemaining_g) / f.weightInitial_g) * 100;
      return percentage >= 75; // Moins de 25% restant
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Vue d'ensemble de ton activité d'impression 3D
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Ventes Totales"
          value={formatCurrency(stats.totalSales, userData?.currency)}
          subtitle={`${stats.jobsCount.vendu} objets vendus`}
          icon={TrendingUp}
          iconColor="#10b981"
          onClick={() => navigate('/sales')}
        />
        <KPICard
          title="Bénéfice Net"
          value={formatCurrency(stats.netProfit, userData?.currency)}
          subtitle={`Coût: ${formatCurrency(stats.totalCost, userData?.currency)}`}
          icon={Wallet}
          iconColor={stats.netProfit >= 0 ? '#10b981' : '#ef4444'}
          onClick={() => navigate('/wallet')}
        />
        <KPICard
          title="Stock Filament"
          value={formatWeight(stats.totalFilamentWeight)}
          subtitle={`Valeur: ${formatCurrency(stats.totalFilamentValue, userData?.currency)}`}
          icon={Package}
          iconColor="#3b82f6"
          onClick={() => navigate('/filaments')}
        />
        <KPICard
          title="Impressions Actives"
          value={stats.jobsCount.enImpression}
          subtitle={`${stats.jobsCount.fini} terminées, ${stats.jobsCount.enVente} en vente`}
          icon={Printer}
          iconColor="#f59e0b"
          onClick={() => navigate('/jobs')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impressions récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Impressions Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Aucune impression pour le moment
              </p>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {job.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {job.filaments.slice(0, 2).map((usage, idx) => {
                          const filament = filaments.find((f) => f.id === usage.filamentId);
                          return filament ? (
                            <FilamentBadge
                              key={idx}
                              name={`${usage.grams}g`}
                              colorHex={filament.colorHex}
                            />
                          ) : null;
                        })}
                      </div>
                    </div>
                    <JobStateBadge state={job.state} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filaments faibles en stock */}
        <Card>
          <CardHeader>
            <CardTitle>Alertes Stock</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockFilaments.length === 0 ? (
              <p className="text-green-600 dark:text-green-400 text-sm">
                Tous les filaments ont un bon niveau de stock !
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockFilaments.map((filament) => {
                  const remaining = (filament.weightRemaining_g / filament.weightInitial_g) * 100;
                  return (
                    <div
                      key={filament.id}
                      className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <FilamentBadge
                          name={filament.name}
                          colorHex={filament.colorHex}
                        />
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          {Math.round(remaining)}% restant
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatWeight(filament.weightRemaining_g)} / {formatWeight(filament.weightInitial_g)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
