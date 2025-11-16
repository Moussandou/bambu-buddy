import type { DateFilterPeriod } from '../components/sales/DateFilter';

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
