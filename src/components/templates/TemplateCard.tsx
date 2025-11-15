import { Edit2, Trash2, Zap } from 'lucide-react';
import type { Template, Filament } from '../../types';
import { Card } from '../ui/Card';
import { FilamentBadge } from '../ui/Badge';
import { formatCurrency, formatDuration } from '../../utils/calculations';
import { useMemo } from 'react';
import { calculateJobTotalCost } from '../../utils/calculations';

interface TemplateCardProps {
  template: Template;
  filaments: Filament[];
  onUse: (template: Template) => void;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  currency?: string;
}

export function TemplateCard({
  template,
  filaments,
  onUse,
  onEdit,
  onDelete,
  currency = 'EUR',
}: TemplateCardProps) {
  // Calcul du coût total
  const filamentsMap = useMemo(() => new Map(filaments.map((f) => [f.id, f])), [filaments]);
  const totalCost = useMemo(
    () => calculateJobTotalCost(template.filaments, filamentsMap),
    [template.filaments, filamentsMap]
  );

  // Image principale
  const mainImage = template.images?.[0];

  return (
    <Card hover>
      <div className="space-y-3">
        {/* Image si disponible */}
        {mainImage && (
          <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img
              src={mainImage}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
            {template.name}
          </h4>

          {template.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {template.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Utilisé {template.timesUsed} fois
            </span>
          </div>
        </div>

        {/* Filaments utilisés */}
        {template.filaments.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.filaments.slice(0, 3).map((usage, idx) => {
              const filament = filamentsMap.get(usage.filamentId);
              return filament ? (
                <FilamentBadge
                  key={idx}
                  name={`${usage.grams}g`}
                  colorHex={filament.colorHex}
                />
              ) : null;
            })}
            {template.filaments.length > 3 && (
              <span className="text-xs text-gray-500">
                +{template.filaments.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Coût</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totalCost, currency)}
            </p>
          </div>
          {template.salePrice && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">Prix</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(template.salePrice, currency)}
              </p>
            </div>
          )}
        </div>

        {/* Durée impression */}
        {template.printDuration_hours && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Durée: {formatDuration(template.printDuration_hours)}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onUse(template)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors"
          >
            <Zap className="w-4 h-4" />
            Utiliser
          </button>
          <button
            onClick={() => onEdit(template)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(template.id)}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
    </Card>
  );
}
