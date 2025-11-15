import { useState } from 'react';
import type { Filament } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FilamentBadge } from '../ui/Badge';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (grams: number, notes?: string) => Promise<void>;
  filament: Filament | null;
  mode: 'consume' | 'add';
}

export function StockModal({ isOpen, onClose, onSubmit, filament, mode }: StockModalProps) {
  const [grams, setGrams] = useState<number>(50);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(grams, notes || undefined);
      // Petit délai pour laisser Firestore propager les changements
      await new Promise(resolve => setTimeout(resolve, 500));
      setGrams(50);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Erreur lors de la mise à jour du stock');
    } finally {
      setLoading(false);
    }
  }

  if (!filament) return null;

  const title = mode === 'consume' ? 'Consommer du filament' : 'Ajouter du filament';
  const action = mode === 'consume' ? 'Consommer' : 'Ajouter';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} isLoading={loading}>
            {action}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Filament info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <FilamentBadge name={filament.name} colorHex={filament.colorHex} />
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Stock actuel : <span className="font-semibold">{filament.weightRemaining_g}g</span>
          </div>
        </div>

        <Input
          label={`Quantité à ${mode === 'consume' ? 'consommer' : 'ajouter'} (g)`}
          type="number"
          value={grams}
          onChange={(e) => setGrams(Number(e.target.value))}
          required
          min={1}
          step={1}
          helperText={
            mode === 'consume'
              ? `Stock après : ${Math.max(0, filament.weightRemaining_g - grams)}g`
              : `Stock après : ${filament.weightRemaining_g + grams}g`
          }
        />

        <Input
          label="Notes (optionnel)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Pour quelle impression, pourquoi..."
        />
      </form>
    </Modal>
  );
}
