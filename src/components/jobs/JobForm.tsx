import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import type { Job, JobFormData, Filament, FilamentUsage } from '../../types';
import { Modal } from '../ui/Modal';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { FilamentBadge } from '../ui/Badge';

interface JobFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JobFormData) => Promise<void>;
  job?: Job | null;
  filaments: Filament[];
}

export function JobForm({ isOpen, onClose, onSubmit, job, filaments }: JobFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    filaments: [],
    salePrice: undefined,
    tags: [],
    printDuration_hours: undefined,
  });

  // Pré-remplir si édition
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        description: job.description,
        filaments: job.filaments,
        salePrice: job.salePrice,
        tags: job.tags,
        printDuration_hours: job.printDuration_hours,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        filaments: [],
        salePrice: undefined,
        tags: [],
        printDuration_hours: undefined,
      });
    }
  }, [job, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting job:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  }

  function addFilament() {
    if (filaments.length === 0) {
      alert('Créez d\'abord des filaments dans la page Filaments');
      return;
    }
    setFormData({
      ...formData,
      filaments: [...formData.filaments, { filamentId: filaments[0].id, grams: 50 }],
    });
  }

  function removeFilament(index: number) {
    setFormData({
      ...formData,
      filaments: formData.filaments.filter((_, i) => i !== index),
    });
  }

  function updateFilamentUsage(index: number, usage: FilamentUsage) {
    const updated = [...formData.filaments];
    updated[index] = usage;
    setFormData({ ...formData, filaments: updated });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={job ? 'Modifier l\'impression' : 'Nouvelle impression'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} isLoading={loading}>
            {job ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Titre"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="Support téléphone, pot de fleur..."
        />

        <Textarea
          label="Description (optionnel)"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          placeholder="Description de l'objet..."
        />

        {/* Filaments */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Filaments utilisés
            </label>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={<Plus className="w-4 h-4" />}
              onClick={addFilament}
            >
              Ajouter
            </Button>
          </div>

          <div className="space-y-2">
            {formData.filaments.map((usage, index) => {
              const filament = filaments.find((f) => f.id === usage.filamentId);
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <select
                    value={usage.filamentId}
                    onChange={(e) =>
                      updateFilamentUsage(index, { ...usage, filamentId: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    {filaments.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>

                  {filament && (
                    <FilamentBadge name={filament.name} colorHex={filament.colorHex} />
                  )}

                  <Input
                    type="number"
                    value={usage.grams}
                    onChange={(e) =>
                      updateFilamentUsage(index, { ...usage, grams: Number(e.target.value) })
                    }
                    min={1}
                    step={1}
                    className="w-24"
                    placeholder="g"
                  />

                  <button
                    type="button"
                    onClick={() => removeFilament(index)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              );
            })}

            {formData.filaments.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aucun filament ajouté
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prix de vente (optionnel)"
            type="number"
            value={formData.salePrice || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                salePrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            min={0}
            step={0.01}
            placeholder="€"
          />

          <Input
            label="Durée impression (h)"
            type="number"
            value={formData.printDuration_hours || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                printDuration_hours: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            min={0}
            step={0.1}
            placeholder="heures"
          />
        </div>

        <Input
          label="Tags (optionnel)"
          value={formData.tags?.join(', ') || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              tags: e.target.value ? e.target.value.split(',').map((t) => t.trim()) : [],
            })
          }
          placeholder="déco, pratique, cadeau..."
          helperText="Séparez les tags par des virgules"
        />
      </form>
    </Modal>
  );
}
