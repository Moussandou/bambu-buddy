import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db, COLLECTIONS } from '../../lib/firebase';
import { Button } from '../ui/Button';

const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export function CurrencySelector() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(userData?.currency || 'EUR');

  async function handleSaveCurrency() {
    if (!userData) return;

    setLoading(true);
    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, userData.uid);
      await updateDoc(userDocRef, {
        currency: selectedCurrency,
      });
      alert('Devise mise à jour avec succès');
    } catch (error) {
      console.error('Error updating currency:', error);
      alert('Erreur lors de la mise à jour de la devise');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <DollarSign className="w-5 h-5" />
        Devise
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sélectionnez votre devise
          </label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} - {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleSaveCurrency}
          isLoading={loading}
          disabled={selectedCurrency === userData?.currency}
        >
          Enregistrer la devise
        </Button>
      </div>
    </div>
  );
}
