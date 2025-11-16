import { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserCollection } from '../hooks/useFirestore';
import { COLLECTIONS } from '../lib/firebase';
import type { Filament, FilamentFormData } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FilamentCard } from '../components/filaments/FilamentCard';
import { FilamentForm } from '../components/filaments/FilamentForm';
import { StockModal } from '../components/filaments/StockModal';
import {
  createFilament,
  updateFilament,
  deleteFilament,
  consumeFilament,
  addFilament,
} from '../services/filaments';

export function Filaments() {
  const { userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('name');
  const [showForm, setShowForm] = useState(false);
  const [editingFilament, setEditingFilament] = useState<Filament | null>(null);
  const [stockModal, setStockModal] = useState<{
    filament: Filament | null;
    mode: 'consume' | 'add';
  }>({ filament: null, mode: 'consume' });

  // Récupère les filaments en temps réel (sans orderBy pour éviter les index)
  const { data: filaments, loading } = useUserCollection<Filament>(
    COLLECTIONS.FILAMENTS,
    userData?.uid
  );

  // Filtres et tri
  const filteredFilaments = useMemo(() => {
    let filtered = filaments;

    // Recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.supplier?.toLowerCase().includes(query) ||
          f.colorName?.toLowerCase().includes(query)
      );
    }

    // Tri
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'stock') {
        const aPercentage = (a.weightRemaining_g / a.weightInitial_g) * 100;
        const bPercentage = (b.weightRemaining_g / b.weightInitial_g) * 100;
        return aPercentage - bPercentage; // Tri croissant (stock faible en premier)
      } else {
        return a.price_per_kg - b.price_per_kg;
      }
    });

    return filtered;
  }, [filaments, searchQuery, sortBy]);

  // Handlers
  async function handleCreateFilament(data: FilamentFormData) {
    if (!userData) return;
    await createFilament(userData.uid, data);
  }

  async function handleUpdateFilament(data: FilamentFormData) {
    if (!editingFilament) return;
    await updateFilament(editingFilament.id, data);
    setEditingFilament(null);
  }

  async function handleDeleteFilament(id: string) {
    if (!confirm('Supprimer ce filament ? Cette action est irréversible.')) return;
    await deleteFilament(id);
  }

  async function handleConsumeStock(grams: number) {
    if (!userData || !stockModal.filament) return;
    await consumeFilament(userData.uid, stockModal.filament.id, grams, undefined);
  }

  async function handleAddStock(grams: number, notes?: string) {
    if (!userData || !stockModal.filament) return;
    await addFilament(userData.uid, stockModal.filament.id, grams, notes);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Filaments
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez votre inventaire de filaments
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par nom, fournisseur, couleur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'stock' | 'price')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="name">Trier par nom</option>
          <option value="stock">Trier par stock</option>
          <option value="price">Trier par prix</option>
        </select>

        {/* Add button */}
        <Button icon={<Plus className="w-5 h-5" />} onClick={() => setShowForm(true)}>
          Nouveau filament
        </Button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total filaments</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {filaments.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Stock bas</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {filaments.filter(
              (f) => ((f.weightInitial_g - f.weightRemaining_g) / f.weightInitial_g) * 100 >= 75
            ).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Stock total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(filaments.reduce((sum, f) => sum + f.weightRemaining_g, 0) / 1000).toFixed(1)} kg
          </p>
        </div>
      </div>

      {/* Grid de filaments */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      ) : filteredFilaments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery
              ? 'Aucun filament trouvé'
              : 'Aucun filament pour le moment'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowForm(true)}>Créer votre premier filament</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFilaments.map((filament) => (
            <FilamentCard
              key={filament.id}
              filament={filament}
              currency={userData?.currency}
              onEdit={(f) => {
                setEditingFilament(f);
                setShowForm(true);
              }}
              onDelete={handleDeleteFilament}
              onConsume={(f) => setStockModal({ filament: f, mode: 'consume' })}
              onAdd={(f) => setStockModal({ filament: f, mode: 'add' })}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <FilamentForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingFilament(null);
        }}
        onSubmit={editingFilament ? handleUpdateFilament : handleCreateFilament}
        filament={editingFilament}
      />

      <StockModal
        isOpen={!!stockModal.filament}
        onClose={() => setStockModal({ filament: null, mode: 'consume' })}
        onSubmit={stockModal.mode === 'consume' ? handleConsumeStock : handleAddStock}
        filament={stockModal.filament}
        mode={stockModal.mode}
      />
    </div>
  );
}
