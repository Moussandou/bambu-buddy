import { useState, useMemo } from 'react';
import { Plus, Download, TrendingUp, DollarSign, Wallet as WalletIcon, Clock } from 'lucide-react';
import { orderBy, addDoc, collection } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useUserCollection } from '../hooks/useFirestore';
import { COLLECTIONS, db } from '../lib/firebase';
import type { Transaction, Sale, Job } from '../types';
import { Button } from '../components/ui/Button';
import { WalletChart } from '../components/wallet/WalletChart';
import { TransactionList } from '../components/wallet/TransactionList';
import { AddExpenseForm } from '../components/wallet/AddExpenseForm';
import { formatCurrency } from '../utils/calculations';
import { calculateJobTotalCost } from '../utils/calculations';
import { exportToJSON } from '../utils/export';

export function Wallet() {
  const { userData } = useAuth();
  const toast = useToast();
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  // Fetch transactions, sales, and jobs
  const { data: transactions, loading: transactionsLoading } = useUserCollection<Transaction>(
    COLLECTIONS.TRANSACTIONS,
    userData?.uid,
    [orderBy('date', 'desc')]
  );

  const { data: sales } = useUserCollection<Sale>(
    COLLECTIONS.SALES,
    userData?.uid
  );

  const { data: jobs } = useUserCollection<Job>(
    COLLECTIONS.JOBS,
    userData?.uid
  );

  const { data: filaments } = useUserCollection(
    COLLECTIONS.FILAMENTS,
    userData?.uid
  );

  // Calculate financial stats
  const stats = useMemo(() => {
    // Total revenue from sales
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.price, 0);

    // Total costs from jobs (filament costs)
    const filamentsMap = new Map(filaments.map((f: any) => [f.id, f]));
    const totalCosts = jobs.reduce((sum, job) => {
      const jobCost = calculateJobTotalCost(job.filaments, filamentsMap);
      const quantity = job.quantity || 1;
      return sum + (jobCost * quantity);
    }, 0);

    // Add manual expenses
    const manualExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpenses = totalCosts + manualExpenses;
    const netProfit = totalRevenue - totalExpenses;

    // Available balance (non-withdrawn)
    const withdrawn = transactions
      .filter((t) => t.withdrawn && (t.type === 'sale' || t.type === 'withdraw'))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const availableBalance = netProfit - withdrawn;

    // Calculate potential revenue from jobs "en vente"
    const jobsOnSale = jobs.filter((j) => j.state === 'en vente');
    const potentialRevenue = jobsOnSale.reduce((sum, job) => {
      const price = job.salePrice || 0;
      const quantity = job.quantity || 1;
      return sum + (price * quantity);
    }, 0);

    return {
      totalRevenue,
      totalCosts: totalExpenses,
      netProfit,
      availableBalance,
      withdrawn,
      potentialRevenue,
    };
  }, [transactions, sales, jobs, filaments]);

  // Add expense handler
  async function handleAddExpense(data: { amount: number; description: string }) {
    if (!userData) return;

    const transaction: Omit<Transaction, 'id'> = {
      userId: userData.uid,
      type: 'expense',
      amount: -Math.abs(data.amount), // Negative for expense
      description: data.description,
      date: Date.now(),
      withdrawn: false,
    };

    await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), transaction);
  }

  // Withdraw funds handler
  async function handleWithdrawFunds() {
    if (!userData) return;

    if (stats.availableBalance <= 0) {
      toast.warning('Aucun fonds disponible à retirer');
      return;
    }

    const amount = prompt(
      `Montant à retirer (max: ${formatCurrency(stats.availableBalance, userData.currency)}) :`
    );

    if (!amount) return;

    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error('Montant invalide');
      return;
    }

    if (withdrawAmount > stats.availableBalance) {
      toast.error('Montant supérieur au solde disponible');
      return;
    }

    // Create withdraw transaction
    const transaction: Omit<Transaction, 'id'> = {
      userId: userData.uid,
      type: 'withdraw',
      amount: -withdrawAmount,
      description: 'Retrait de fonds',
      date: Date.now(),
      withdrawn: true,
    };

    await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), transaction);
  }

  // Mark all as withdrawn
  async function handleMarkAllWithdrawn() {
    if (!userData) return;

    if (stats.availableBalance <= 0) {
      toast.warning('Aucun fonds disponible');
      return;
    }

    if (!confirm(`Marquer ${formatCurrency(stats.availableBalance, userData.currency)} comme retirés ?`)) {
      return;
    }

    // Create a withdraw transaction for the full available balance
    const transaction: Omit<Transaction, 'id'> = {
      userId: userData.uid,
      type: 'withdraw',
      amount: -stats.availableBalance,
      description: 'Retrait complet',
      date: Date.now(),
      withdrawn: true,
    };

    await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), transaction);
  }

  function handleExportTransactions() {
    const filename = `transactions_${new Date().toISOString().split('T')[0]}.json`;
    exportToJSON(transactions, filename);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Portefeuille
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Suivi financier et gestion des transactions
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<Download className="w-5 h-5" />}
            onClick={handleExportTransactions}
          >
            Exporter
          </Button>
          <Button
            icon={<Plus className="w-5 h-5" />}
            onClick={() => setShowExpenseForm(true)}
          >
            Ajouter dépense
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total ventes</p>
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats.totalRevenue, userData?.currency)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total coûts</p>
            <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400 rotate-180" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats.totalCosts, userData?.currency)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Bénéfice net</p>
            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p
            className={`text-3xl font-bold ${
              stats.netProfit >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatCurrency(stats.netProfit, userData?.currency)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Disponible</p>
            <WalletIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats.availableBalance, userData?.currency)}
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              onClick={handleWithdrawFunds}
              disabled={stats.availableBalance <= 0}
            >
              Retirer
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleMarkAllWithdrawn}
              disabled={stats.availableBalance <= 0}
            >
              Tout retirer
            </Button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg shadow-md p-6 border-2 border-amber-200 dark:border-amber-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">À venir</p>
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
            {formatCurrency(stats.potentialRevenue, userData?.currency)}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
            Revenus potentiels des objets en vente
          </p>
        </div>
      </div>

      {/* Chart and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WalletChart
          totalRevenue={stats.totalRevenue}
          totalCosts={stats.totalCosts}
          currency={userData?.currency}
        />

        {transactionsLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        ) : (
          <TransactionList transactions={transactions} currency={userData?.currency} />
        )}
      </div>

      {/* Add Expense Form */}
      <AddExpenseForm
        isOpen={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        onSubmit={handleAddExpense}
      />
    </div>
  );
}
