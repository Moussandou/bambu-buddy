import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useUserCollection } from '../hooks/useFirestore';
import { COLLECTIONS } from '../lib/firebase';
import type { Template, Filament, TemplateFormData } from '../types';
import { Button } from '../components/ui/Button';
import { TemplateForm } from '../components/templates/TemplateForm';
import { TemplateCard } from '../components/templates/TemplateCard';
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  incrementTemplateUsage,
} from '../services/templates';
import { uploadImages } from '../services/storage';
import { createJob } from '../services/jobs';
import { LoadingState } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';

export function Templates() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Récupère les données en temps réel
  const { data: templates, loading } = useUserCollection<Template>(
    COLLECTIONS.TEMPLATES,
    userData?.uid,
    [orderBy('timesUsed', 'desc')]
  );

  const { data: filaments } = useUserCollection<Filament>(
    COLLECTIONS.FILAMENTS,
    userData?.uid
  );

  // Handlers
  async function handleCreateTemplate(
    data: TemplateFormData,
    newImages: File[],
    _existingImages: string[]
  ) {
    if (!userData) return;

    // Upload images
    let imageUrls: string[] = [];
    if (newImages.length > 0) {
      const basePath = `templates/${userData.uid}/${Date.now()}`;
      imageUrls = await uploadImages(newImages, basePath);
    }

    await createTemplate(userData.uid, data, imageUrls);
  }

  async function handleUpdateTemplate(
    data: TemplateFormData,
    newImages: File[],
    existingImages: string[]
  ) {
    if (!editingTemplate) return;

    // Upload new images
    let uploadedUrls: string[] = [];
    if (newImages.length > 0) {
      const basePath = `templates/${userData?.uid}/${editingTemplate.id}`;
      uploadedUrls = await uploadImages(newImages, basePath);
    }

    const finalImageUrls = [...existingImages, ...uploadedUrls];

    await updateTemplate(editingTemplate.id, data, finalImageUrls);
    setEditingTemplate(null);
  }

  async function handleDeleteTemplate(id: string) {
    if (!confirm('Supprimer ce template ? Cette action est irréversible.')) return;
    await deleteTemplate(id);
  }

  async function handleUseTemplate(template: Template) {
    if (!userData) return;

    // Ask for quantity
    const quantityStr = prompt('Combien d\'exemplaires voulez-vous imprimer ?', '1');
    if (!quantityStr) return; // User cancelled

    const quantity = parseInt(quantityStr);
    if (isNaN(quantity) || quantity < 1) {
      toast.error('Quantité invalide');
      return;
    }

    try {
      // Create job from template
      const jobData = {
        title: template.name,
        description: template.description,
        filaments: template.filaments,
        salePrice: template.salePrice,
        tags: template.tags,
        printDuration_hours: template.printDuration_hours,
        quantity,
      };

      await createJob(userData.uid, jobData, false, [], template.images || []);

      // Increment template usage count
      await incrementTemplateUsage(template.id);

      // Redirect to Jobs page
      toast.success(`${quantity} impression(s) créée(s) depuis le template`);
      navigate('/jobs');
    } catch (error) {
      console.error('Error creating job from template:', error);
      toast.error('Erreur lors de la création de l\'impression depuis le template');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Créez des modèles pour vos impressions fréquentes
          </p>
        </div>

        <Button icon={<Plus className="w-5 h-5" />} onClick={() => setShowForm(true)}>
          Nouveau template
        </Button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <LoadingState message="Chargement des templates..." />
      ) : templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun template"
          description="Les templates vous permettent de créer rapidement des impressions récurrentes"
          actionLabel="Créer votre premier template"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              filaments={filaments}
              onUse={handleUseTemplate}
              onEdit={(tmpl) => {
                setEditingTemplate(tmpl);
                setShowForm(true);
              }}
              onDelete={handleDeleteTemplate}
              currency={userData?.currency}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <TemplateForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTemplate(null);
        }}
        onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
        template={editingTemplate}
        filaments={filaments}
      />
    </div>
  );
}
