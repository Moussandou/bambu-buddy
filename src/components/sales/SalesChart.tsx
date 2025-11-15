import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Sale } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface SalesChartProps {
  sales: Sale[];
  currency?: string;
}

interface MonthData {
  month: string;
  ventes: number;
  count: number;
}

export function SalesChart({ sales, currency = 'EUR' }: SalesChartProps) {
  // Group sales by month
  const chartData = useMemo(() => {
    const monthsMap = new Map<string, { total: number; count: number }>();

    sales.forEach((sale) => {
      const date = new Date(sale.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const existing = monthsMap.get(monthKey);
      if (existing) {
        existing.total += sale.price;
        existing.count += 1;
      } else {
        monthsMap.set(monthKey, { total: sale.price, count: 1 });
      }
    });

    // Convert to array and sort by date
    const data: MonthData[] = Array.from(monthsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        const date = new Date(Number(year), Number(month) - 1);
        return {
          month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          ventes: value.total,
          count: value.count,
        };
      });

    // Keep only last 12 months
    return data.slice(-12);
  }, [sales]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Pas assez de données pour afficher le graphique
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Ventes par mois
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="month"
            className="text-xs"
            stroke="#9CA3AF"
          />
          <YAxis
            className="text-xs"
            stroke="#9CA3AF"
            tickFormatter={(value) => `${value}€`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'ventes') {
                return [formatCurrency(value, currency), 'Ventes'];
              }
              return [value, 'Nombre de ventes'];
            }}
          />
          <Legend />
          <Bar
            dataKey="ventes"
            fill="#3b82f6"
            radius={[8, 8, 0, 0]}
            name="Ventes (€)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
