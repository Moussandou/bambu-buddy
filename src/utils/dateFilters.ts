export type DateFilterPeriod = 'all' | 'today' | 'week' | 'month' | 'year';

/**
 * Filter items by date period
 */
export function filterByPeriod<T extends { date: number }>(
  items: T[],
  period: DateFilterPeriod
): T[] {
  if (period === 'all') return items;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let startDate: Date;
  switch (period) {
    case 'today':
      startDate = today;
      break;
    case 'week':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - 1);
      break;
  }

  return items.filter((item) => item.date >= startDate.getTime());
}
