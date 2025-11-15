import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/calculations';

interface WalletChartProps {
  totalRevenue: number;
  totalCosts: number;
  currency?: string;
}

const COLORS = {
  revenue: '#10b981', // green
  costs: '#ef4444', // red
};

export function WalletChart({ totalRevenue, totalCosts, currency = 'EUR' }: WalletChartProps) {
  const data = [
    { name: 'Revenus', value: totalRevenue, color: COLORS.revenue },
    { name: 'Coûts', value: totalCosts, color: COLORS.costs },
  ];

  // Don't show chart if no data
  if (totalRevenue === 0 && totalCosts === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Pas encore de données financières
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Revenus vs Coûts
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            label={(entry) => `${entry.name}: ${formatCurrency(entry.value, currency)}`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
            }}
            formatter={(value: number) => formatCurrency(value, currency)}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Net profit display */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bénéfice net</p>
        <p
          className={`text-2xl font-bold ${
            totalRevenue - totalCosts >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatCurrency(totalRevenue - totalCosts, currency)}
        </p>
      </div>
    </div>
  );
}
