import { DollarSign, Package, Clock, Tag } from 'lucide-react';
import type { Job, Filament } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { JobStateBadge, FilamentBadge } from '../ui/Badge';
import { formatCurrency, formatDuration, calculateJobTotalCost } from '../../utils/calculations';
import { useMemo } from 'react';

interface JobDetailProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  filaments: Filament[];
  onMarkAsSold?: (job: Job) => void;
  currency?: string;
}

export function JobDetail({
  isOpen,
  onClose,
  job,
  filaments,
  onMarkAsSold,
  currency = 'EUR',
}: JobDetailProps) {
  const filamentsMap = useMemo(() => new Map(filaments.map((f) => [f.id, f])), [filaments]);

  const totalCost = useMemo(
    () => (job ? calculateJobTotalCost(job.filaments, filamentsMap) : 0),
    [job, filamentsMap]
  );

  const profit = job?.salePrice ? job.salePrice - totalCost : undefined;

  if (!job) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={job.title}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
          {job.state !== 'vendu' && onMarkAsSold && (
            <Button
              variant="primary"
              onClick={() => onMarkAsSold(job)}
            >
              Marquer comme vendu
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        {/* Status */}
        <div>
          <JobStateBadge state={job.state} />
        </div>

        {/* Images */}
        {job.images && job.images.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Images</h4>
            <div className="grid grid-cols-2 gap-3">
              {job.images.map((url, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`${job.title} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {job.description && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
            <p className="text-gray-600 dark:text-gray-400">{job.description}</p>
          </div>
        )}

        {/* Filaments */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Filaments utilisés
          </h4>
          <div className="space-y-2">
            {job.filaments.map((usage, idx) => {
              const filament = filamentsMap.get(usage.filamentId);
              if (!filament) return null;

              const cost = (usage.grams / 1000) * filament.price_per_kg;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FilamentBadge name={filament.name} colorHex={filament.colorHex} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {usage.grams}g
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(cost, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coûts & Prix */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Coût total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalCost, currency)}
            </p>
          </div>

          {job.salePrice && (
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">
                Prix de vente
              </p>
              <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                {formatCurrency(job.salePrice, currency)}
              </p>
            </div>
          )}
        </div>

        {/* Profit si vendu */}
        {profit !== undefined && job.state === 'vendu' && (
          <div className={`p-4 rounded-lg ${profit >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className={`w-5 h-5 ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              <p className={`text-sm font-medium ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {profit >= 0 ? 'Bénéfice' : 'Perte'}
              </p>
            </div>
            <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {formatCurrency(Math.abs(profit), currency)}
            </p>
          </div>
        )}

        {/* Infos supplémentaires */}
        <div className="grid grid-cols-2 gap-4">
          {job.printDuration_hours && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Durée: {formatDuration(job.printDuration_hours)}</span>
            </div>
          )}

          {job.tags && job.tags.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Tag className="w-4 h-4" />
              <span>{job.tags.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p>Créé le {new Date(job.createdAt).toLocaleDateString('fr-FR')}</p>
          {job.soldAt && (
            <p>Vendu le {new Date(job.soldAt).toLocaleDateString('fr-FR')}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
