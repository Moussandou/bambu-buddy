import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';
import type { Transaction } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { formatDate } from '../../lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  currency?: string;
}

const typeIcons = {
  sale: TrendingUp,
  expense: TrendingDown,
  withdraw: DollarSign,
  filament_purchase: Package,
};

const typeLabels = {
  sale: 'Vente',
  expense: 'Dépense',
  withdraw: 'Retrait',
  filament_purchase: 'Achat filament',
};

const typeColors = {
  sale: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  expense: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  withdraw: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  filament_purchase: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
};

export function TransactionList({ transactions, currency = 'EUR' }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Aucune transaction</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Transactions récentes
        </h3>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {transactions.map((transaction) => {
          const Icon = typeIcons[transaction.type];
          const isPositive = transaction.type === 'sale';

          return (
            <div
              key={transaction.id}
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${typeColors[transaction.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.description || typeLabels[transaction.type]}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      isPositive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isPositive ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount), currency)}
                  </p>
                  {transaction.withdrawn && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Retiré</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
