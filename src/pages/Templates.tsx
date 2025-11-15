import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
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
} from '../services/templates';
import { uploadImages } from '../services/storage';

export function Templates() {
  const { userData } = useAuth();
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
    existingImages: string[]
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
    // This will be implemented to create a job from template
    alert('Fonctionnalité à venir : créer une impression depuis ce template');
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
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Aucun template pour le moment
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Les templates vous permettent de créer rapidement des impressions récurrentes
          </p>
          <Button onClick={() => setShowForm(true)}>Créer votre premier template</Button>
        </div>
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
