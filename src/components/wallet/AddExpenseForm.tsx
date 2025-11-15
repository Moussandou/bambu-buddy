import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';

interface ExpenseFormData {
  amount: number;
  description: string;
}

interface AddExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
}

export function AddExpenseForm({ isOpen, onClose, onSubmit }: AddExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: 0,
    description: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.amount <= 0) {
      alert('Le montant doit être supérieur à 0');
      return;
    }

    setLoading(true);

    try {
      await onSubmit(formData);
      setFormData({ amount: 0, description: '' });
      onClose();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Erreur lors de l\'ajout de la dépense');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter une dépense"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} isLoading={loading}>
            Ajouter
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Montant (€)"
          type="number"
          value={formData.amount || ''}
          onChange={(e) =>
            setFormData({ ...formData, amount: Number(e.target.value) })
          }
          min={0}
          step={0.01}
          required
          placeholder="25.50"
          autoFocus
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          required
          placeholder="Électricité, maintenance, matériel..."
        />
      </form>
    </Modal>
  );
}
