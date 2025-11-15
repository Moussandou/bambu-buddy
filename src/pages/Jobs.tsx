import { useState } from 'react';
import { Plus } from 'lucide-react';
import { orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useUserCollection } from '../hooks/useFirestore';
import { COLLECTIONS } from '../lib/firebase';
import type { Job, Filament, JobFormData, JobState } from '../types';
import { Button } from '../components/ui/Button';
import { KanbanBoard } from '../components/jobs/KanbanBoard';
import { JobForm } from '../components/jobs/JobForm';
import { JobDetail } from '../components/jobs/JobDetail';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import {
  createJob,
  updateJob,
  updateJobState,
  deleteJob,
  markJobAsSold,
} from '../services/jobs';

export function Jobs() {
  const { userData } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [soldModal, setSoldModal] = useState<{ job: Job | null; price: string }>({
    job: null,
    price: '',
  });

  // Récupère les données en temps réel
  const { data: jobs, loading } = useUserCollection<Job>(
    COLLECTIONS.JOBS,
    userData?.uid,
    [orderBy('createdAt', 'desc')]
  );

  const { data: filaments } = useUserCollection<Filament>(
    COLLECTIONS.FILAMENTS,
    userData?.uid
  );

  // Handlers
  async function handleCreateJob(data: JobFormData) {
    if (!userData) return;
    await createJob(userData.uid, data, true); // auto-consume filament
  }

  async function handleUpdateJob(data: JobFormData) {
    if (!editingJob) return;
    await updateJob(editingJob.id, data);
    setEditingJob(null);
  }

  async function handleDeleteJob(id: string) {
    if (!confirm('Supprimer cette impression ? Cette action est irréversible.')) return;
    await deleteJob(id);
  }

  async function handleStateChange(jobId: string, newState: JobState) {
    // Si on marque comme vendu, demander le prix
    if (newState === 'vendu') {
      const job = jobs.find((j) => j.id === jobId);
      if (job) {
        setSoldModal({ job, price: job.salePrice?.toString() || '' });
        return;
      }
    }

    await updateJobState(jobId, newState);
  }

  async function handleMarkAsSold() {
    if (!soldModal.job || !soldModal.price) return;

    const price = parseFloat(soldModal.price);
    if (isNaN(price) || price <= 0) {
      alert('Prix invalide');
      return;
    }

    await markJobAsSold(soldModal.job.id, price);
    setSoldModal({ job: null, price: '' });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Impressions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos impressions en cours et terminées
          </p>
        </div>

        <Button icon={<Plus className="w-5 h-5" />} onClick={() => setShowForm(true)}>
          Nouvelle impression
        </Button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">En impression</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {jobs.filter((j) => j.state === 'en impression').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Terminé</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {jobs.filter((j) => j.state === 'fini').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">En vente</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {jobs.filter((j) => j.state === 'en vente').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Vendu</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {jobs.filter((j) => j.state === 'vendu').length}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Aucune impression pour le moment
          </p>
          <Button onClick={() => setShowForm(true)}>Créer votre première impression</Button>
        </div>
      ) : (
        <KanbanBoard
          jobs={jobs}
          filaments={filaments}
          onJobStateChange={handleStateChange}
          onJobView={setViewingJob}
          onJobEdit={(job) => {
            setEditingJob(job);
            setShowForm(true);
          }}
          onJobDelete={handleDeleteJob}
          currency={userData?.currency}
        />
      )}

      {/* Modals */}
      <JobForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingJob(null);
        }}
        onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
        job={editingJob}
        filaments={filaments}
      />

      <JobDetail
        isOpen={!!viewingJob}
        onClose={() => setViewingJob(null)}
        job={viewingJob}
        filaments={filaments}
        onMarkAsSold={(job) => {
          setViewingJob(null);
          setSoldModal({ job, price: job.salePrice?.toString() || '' });
        }}
        currency={userData?.currency}
      />

      {/* Modal de confirmation vente */}
      <Modal
        isOpen={!!soldModal.job}
        onClose={() => setSoldModal({ job: null, price: '' })}
        title="Marquer comme vendu"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSoldModal({ job: null, price: '' })}>
              Annuler
            </Button>
            <Button onClick={handleMarkAsSold}>
              Confirmer la vente
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Marquer <span className="font-semibold">{soldModal.job?.title}</span> comme vendu
          </p>

          <Input
            label="Prix de vente (€)"
            type="number"
            value={soldModal.price}
            onChange={(e) => setSoldModal({ ...soldModal, price: e.target.value })}
            min={0}
            step={0.01}
            required
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
}
