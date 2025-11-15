import { Calendar } from 'lucide-react';

export type DateFilterPeriod = 'all' | 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear';

interface DateFilterProps {
  period: DateFilterPeriod;
  onChange: (period: DateFilterPeriod) => void;
}

const periods: { value: DateFilterPeriod; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'thisMonth', label: 'Ce mois' },
  { value: 'lastMonth', label: 'Mois dernier' },
  { value: 'last3Months', label: '3 derniers mois' },
  { value: 'thisYear', label: 'Cette année' },
];

export function DateFilter({ period, onChange }: DateFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      <select
        value={period}
        onChange={(e) => onChange(e.target.value as DateFilterPeriod)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        {periods.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Filter sales by date period
 */
export function filterSalesByPeriod<T extends { date: number }>(
  items: T[],
  period: DateFilterPeriod
): T[] {
  if (period === 'all') return items;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime();
  const start3MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1).getTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

  return items.filter((item) => {
    switch (period) {
      case 'thisMonth':
        return item.date >= startOfMonth;
      case 'lastMonth':
        return item.date >= startOfLastMonth && item.date <= endOfLastMonth;
      case 'last3Months':
        return item.date >= start3MonthsAgo;
      case 'thisYear':
        return item.date >= startOfYear;
      default:
        return true;
    }
  });
}
