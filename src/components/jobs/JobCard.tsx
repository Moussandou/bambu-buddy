import { Eye, Edit2, Trash2 } from 'lucide-react';
import type { Job, Filament } from '../../types';
import { Card } from '../ui/Card';
import { JobStateBadge, FilamentBadge } from '../ui/Badge';
import { formatCurrency, formatDuration } from '../../utils/calculations';
import { useMemo } from 'react';
import { calculateJobTotalCost } from '../../utils/calculations';

interface JobCardProps {
  job: Job;
  filaments: Filament[];
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  currency?: string;
  isDragging?: boolean;
}

export function JobCard({
  job,
  filaments,
  onView,
  onEdit,
  onDelete,
  currency = 'EUR',
  isDragging = false,
}: JobCardProps) {
  // Calcul du coût total
  const filamentsMap = useMemo(() => new Map(filaments.map((f) => [f.id, f])), [filaments]);
  const totalCost = useMemo(
    () => calculateJobTotalCost(job.filaments, filamentsMap),
    [job.filaments, filamentsMap]
  );
  const profit = job.salePrice ? job.salePrice - totalCost : undefined;

  // Image principale
  const mainImage = job.images?.[0];

  return (
    <Card
      className={`cursor-move ${isDragging ? 'opacity-50 rotate-2' : ''}`}
      hover={!isDragging}
    >
      <div className="space-y-3">
        {/* Image si disponible */}
        {mainImage && (
          <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img
              src={mainImage}
              alt={job.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
              {job.title}
            </h4>
            <JobStateBadge state={job.state} />
          </div>

          {job.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {job.description}
            </p>
          )}
        </div>

        {/* Filaments utilisés */}
        {job.filaments.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.filaments.slice(0, 3).map((usage, idx) => {
              const filament = filamentsMap.get(usage.filamentId);
              return filament ? (
                <FilamentBadge
                  key={idx}
                  name={`${usage.grams}g`}
                  colorHex={filament.colorHex}
                />
              ) : null;
            })}
            {job.filaments.length > 3 && (
              <span className="text-xs text-gray-500">
                +{job.filaments.length - 3}
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
          {job.salePrice && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                {job.state === 'vendu' ? 'Vendu' : 'Prix'}
              </p>
              <p className={`font-semibold ${profit && profit > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                {formatCurrency(job.salePrice, currency)}
              </p>
            </div>
          )}
        </div>

        {/* Profit si vendu */}
        {profit !== undefined && job.state === 'vendu' && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Profit</p>
            <p className={`text-lg font-bold ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(profit, currency)}
            </p>
          </div>
        )}

        {/* Durée impression */}
        {job.printDuration_hours && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Durée: {formatDuration(job.printDuration_hours)}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onView(job)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            Voir
          </button>
          <button
            onClick={() => onEdit(job)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(job.id)}
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
