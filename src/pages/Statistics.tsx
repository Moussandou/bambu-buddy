import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Package, DollarSign, Clock, FileText, Table2, FileSpreadsheet } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useUserCollection } from '../hooks/useFirestore';
import { COLLECTIONS } from '../lib/firebase';
import type { Job, Filament } from '../types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { exportJobsToPDF, exportJobsToExcel, exportJobsToCSV, exportStatisticsToPDF } from '../services/export';

export function Statistics() {
  const { userData } = useAuth();
  const currency = userData?.currency || 'EUR';

  const { data: jobs = [] } = useUserCollection<Job>(
    COLLECTIONS.JOBS,
    userData?.uid
  );

  const { data: filaments = [] } = useUserCollection<Filament>(
    COLLECTIONS.FILAMENTS,
    userData?.uid
  );

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculs statistiques
  const stats = useMemo(() => {
    const soldJobs = jobs.filter((j) => j.state === 'vendu');
    const completedJobs = jobs.filter((j) => j.state === 'fini' || j.state === 'vendu');

    // Créer une map des filaments
    const filamentsMap = new Map(filaments.map((f) => [f.id, f]));

    // Calcul des revenus et coûts
    let totalRevenue = 0;
    let totalCost = 0;

    soldJobs.forEach((job) => {
      totalRevenue += (job.salePrice || 0) * (job.quantity || 1);

      // Calculer le coût
      job.filaments.forEach((usage) => {
        const filament = filamentsMap.get(usage.filamentId);
        if (filament) {
          const gramsUsed = usage.grams * (job.quantity || 1);
          const cost = (gramsUsed / 1000) * filament.price_per_kg;
          totalCost += cost;
        }
      });
    });

    const totalProfit = totalRevenue - totalCost;

    // Temps total d'impression
    const totalPrintTime = completedJobs.reduce(
      (sum, job) => sum + (job.printDuration_hours || 0) * (job.quantity || 1),
      0
    );

    // Filament le plus utilisé
    const filamentUsage = new Map<string, number>();
    jobs.forEach((job) => {
      job.filaments.forEach((usage) => {
        const current = filamentUsage.get(usage.filamentId) || 0;
        filamentUsage.set(usage.filamentId, current + usage.grams * (job.quantity || 1));
      });
    });

    let mostUsedFilament: { name: string; grams: number } | null = null;
    filamentUsage.forEach((grams, filamentId) => {
      const filament = filamentsMap.get(filamentId);
      if (filament && (!mostUsedFilament || grams > mostUsedFilament.grams)) {
        mostUsedFilament = { name: filament.name, grams };
      }
    });

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      totalPrintTime,
      completedJobs: completedJobs.length,
      soldJobs: soldJobs.length,
      mostUsedFilament,
    };
  }, [jobs, filaments]);

  // Données pour les graphiques
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const data = months.map((month, index) => {
      const monthJobs = jobs.filter((j) => {
        if (!j.soldAt && !j.updatedAt) return false;
        const date = new Date((j.soldAt || j.updatedAt)!);
        return date.getMonth() === index;
      });

      const revenue = monthJobs.reduce(
        (sum, j) => sum + (j.salePrice || 0) * (j.quantity || 1),
        0
      );

      return {
        month,
        revenue,
        jobs: monthJobs.length,
      };
    });

    return data;
  }, [jobs]);

  const stateData = useMemo(() => {
    const states = {
      'à faire': 0,
      'en impression': 0,
      'fini': 0,
      'en vente': 0,
      'vendu': 0,
    };

    jobs.forEach((job) => {
      states[job.state]++;
    });

    return Object.entries(states).map(([name, value]) => ({ name, value }));
  }, [jobs]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            Statistiques
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analysez vos performances et optimisez votre production
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => exportStatisticsToPDF(stats, currency)}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Stats PDF
          </Button>
          <Button
            onClick={() => exportJobsToPDF(jobs, filaments, currency)}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Jobs PDF
          </Button>
          <Button
            onClick={() => exportJobsToExcel(jobs, filaments)}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </Button>
          <Button
            onClick={() => exportJobsToCSV(jobs, filaments)}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Table2 className="w-4 h-4" />
            CSV
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {[
          {
            icon: DollarSign,
            label: 'Profit total',
            value: formatCurrency(stats.totalProfit),
            gradient: 'from-green-500 to-emerald-500',
          },
          {
            icon: TrendingUp,
            label: 'Chiffre d\'affaires',
            value: formatCurrency(stats.totalRevenue),
            gradient: 'from-blue-500 to-cyan-500',
          },
          {
            icon: Package,
            label: 'Impressions vendues',
            value: stats.soldJobs.toString(),
            trend: `${stats.completedJobs} total`,
            gradient: 'from-purple-500 to-pink-500',
          },
          {
            icon: Clock,
            label: 'Temps d\'impression',
            value: `${Math.round(stats.totalPrintTime)}h`,
            trend: `${Math.round(stats.totalPrintTime / 24)} jours`,
            gradient: 'from-orange-500 to-red-500',
          },
          {
            icon: BarChart3,
            label: 'ROI moyen',
            value: stats.totalRevenue > 0 ? `${Math.round((stats.totalProfit / stats.totalCost) * 100)}%` : '0%',
            trend: 'Retour sur investissement',
            gradient: 'from-pink-500 to-rose-500',
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              {stat.trend && (
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenus mensuels
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                name="Revenus (€)"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Jobs by State */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Répartition par statut
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stateData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stateData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Jobs Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Nombre d'impressions par mois
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="jobs" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Impressions" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
