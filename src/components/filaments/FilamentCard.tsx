import { Trash2, Edit2, Plus, Minus } from 'lucide-react';
import type { Filament } from '../../types';
import { Card } from '../ui/Card';
import { FilamentBadge } from '../ui/Badge';
import { FilamentProgress } from '../ui/ProgressBar';
import { formatCurrency } from '../../utils/calculations';

interface FilamentCardProps {
  filament: Filament;
  onEdit: (filament: Filament) => void;
  onDelete: (id: string) => void;
  onConsume: (filament: Filament) => void;
  onAdd: (filament: Filament) => void;
  currency?: string;
}

export function FilamentCard({
  filament,
  onEdit,
  onDelete,
  onConsume,
  onAdd,
  currency = 'EUR',
}: FilamentCardProps) {
  const usagePercentage =
    ((filament.weightInitial_g - filament.weightRemaining_g) / filament.weightInitial_g) * 100;
  const remainingValue = (filament.weightRemaining_g / 1000) * filament.price_per_kg;
  const isLowStock = usagePercentage >= 75; // Moins de 25% restant

  return (
    <Card className={`${isLowStock ? 'ring-2 ring-red-500' : ''}`} hover>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FilamentBadge name={filament.name} colorHex={filament.colorHex} />
              {isLowStock && (
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
                  Stock bas
                </span>
              )}
            </div>
            {filament.supplier && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fournisseur : {filament.supplier}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(filament)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => onDelete(filament.id)}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <FilamentProgress
          weightInitial={filament.weightInitial_g}
          weightRemaining={filament.weightRemaining_g}
          name="Stock"
          colorHex={filament.colorHex}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Prix/kg</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(filament.price_per_kg, currency)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Valeur restante</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(remainingValue, currency)}
            </p>
          </div>
        </div>

        {/* Notes */}
        {filament.notes && (
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            {filament.notes}
          </p>
        )}

        {/* Stock Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onConsume(filament)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Minus className="w-4 h-4" />
            Consommer
          </button>
          <button
            onClick={() => onAdd(filament)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>
    </Card>
  );
}
