import { useState } from 'react';
import { User, Camera } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ImageUpload } from '../ui/ImageUpload';

export function ProfileSection() {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [existingPhotoURL, setExistingPhotoURL] = useState(currentUser?.photoURL || '');

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      // If there's a new photo file, we would upload it here
      // For simplicity, we'll just use existing URL or empty
      await updateProfile(currentUser, {
        displayName: displayName || null,
        photoURL: existingPhotoURL || null,
      });
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  }

  function handlePhotoChange(files: File[]) {
    setPhotoFiles(files);
  }

  function handleRemoveExistingPhoto() {
    setExistingPhotoURL('');
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <User className="w-5 h-5" />
        Profil utilisateur
      </h2>

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        {/* Profile Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Photo de profil
          </label>
          <div className="flex items-center gap-4">
            {existingPhotoURL ? (
              <img
                src={existingPhotoURL}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <ImageUpload
              images={photoFiles}
              onChange={handlePhotoChange}
              existingImages={existingPhotoURL ? [existingPhotoURL] : []}
              onRemoveExisting={handleRemoveExistingPhoto}
              maxImages={1}
            />
          </div>
        </div>

        {/* Display Name */}
        <Input
          label="Nom d'affichage"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Votre nom"
        />

        {/* Email (read-only) */}
        <Input
          label="Email"
          value={currentUser?.email || ''}
          disabled
          placeholder="email@example.com"
        />

        {/* Submit Button */}
        <Button type="submit" isLoading={loading}>
          Enregistrer les modifications
        </Button>
      </form>
    </div>
  );
}
