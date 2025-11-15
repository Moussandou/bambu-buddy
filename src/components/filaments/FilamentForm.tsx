import { useState, useEffect } from 'react';
import type { Filament, FilamentFormData } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';

interface FilamentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FilamentFormData) => Promise<void>;
  filament?: Filament | null;
}

export function FilamentForm({ isOpen, onClose, onSubmit, filament }: FilamentFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FilamentFormData>({
    name: '',
    colorHex: '#3b82f6',
    colorName: '',
    weightInitial_g: 1000,
    price_per_kg: 15,
    supplier: '',
    notes: '',
  });

  // Pré-remplir si édition
  useEffect(() => {
    if (filament) {
      setFormData({
        name: filament.name,
        colorHex: filament.colorHex,
        colorName: filament.colorName,
        weightInitial_g: filament.weightInitial_g,
        price_per_kg: filament.price_per_kg,
        supplier: filament.supplier,
        notes: filament.notes,
      });
    } else {
      // Reset pour création
      setFormData({
        name: '',
        colorHex: '#3b82f6',
        colorName: '',
        weightInitial_g: 1000,
        price_per_kg: 15,
        supplier: '',
        notes: '',
      });
    }
  }, [filament, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      // Petit délai pour laisser Firestore propager les changements
      await new Promise(resolve => setTimeout(resolve, 500));
      onClose();
    } catch (error) {
      console.error('Error submitting filament:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={filament ? 'Modifier le filament' : 'Nouveau filament'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} isLoading={loading}>
            {filament ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom du filament"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="PLA Bleu"
        />

        <ColorPicker
          label="Couleur"
          color={formData.colorHex}
          onChange={(color) => setFormData({ ...formData, colorHex: color })}
        />

        <Input
          label="Nom de la couleur (optionnel)"
          value={formData.colorName || ''}
          onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
          placeholder="Bleu ciel"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Poids initial (g)"
            type="number"
            value={formData.weightInitial_g}
            onChange={(e) =>
              setFormData({ ...formData, weightInitial_g: Number(e.target.value) })
            }
            required
            min={1}
            step={1}
          />

          <Input
            label="Prix par kg (€)"
            type="number"
            value={formData.price_per_kg}
            onChange={(e) =>
              setFormData({ ...formData, price_per_kg: Number(e.target.value) })
            }
            required
            min={0}
            step={0.01}
          />
        </div>

        <Input
          label="Fournisseur (optionnel)"
          value={formData.supplier || ''}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          placeholder="Bambu Lab, Polymaker..."
        />

        <Input
          label="Notes (optionnel)"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Excellente finition, température 210°C..."
        />
      </form>
    </Modal>
  );
}
