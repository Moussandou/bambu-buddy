import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
  images: File[];
  onChange: (files: File[]) => void;
  existingImages?: string[]; // URLs des images déjà uploadées
  onRemoveExisting?: (url: string) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({
  images,
  onChange,
  existingImages = [],
  onRemoveExisting,
  maxImages = 5,
  disabled = false,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = existingImages.length + images.length;
  const canAddMore = totalImages < maxImages;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = maxImages - totalImages;
    const filesToAdd = files.slice(0, remaining);

    // Valider les fichiers
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of filesToAdd) {
      // Vérifier le type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert(`${file.name}: format non supporté. Utilisez JPG, PNG, WEBP ou GIF.`);
        continue;
      }

      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name}: fichier trop volumineux (max 5MB)`);
        continue;
      }

      validFiles.push(file);

      // Créer preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          setPreviews([...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    if (validFiles.length > 0) {
      onChange([...images, ...validFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function removeNewImage(index: number) {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    onChange(newImages);
    setPreviews(newPreviews);
  }

  function handleRemoveExisting(url: string) {
    if (onRemoveExisting) {
      onRemoveExisting(url);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Images ({totalImages}/{maxImages})
        </label>

        {canAddMore && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            Ajouter
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Images existantes */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {existingImages.map((url) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 group"
            >
              <img
                src={url}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />
              {!disabled && onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => handleRemoveExisting(url)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Nouvelles images (previews) */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 group"
            >
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="absolute bottom-1 left-1 px-2 py-1 bg-black/60 text-white text-xs rounded">
                Nouveau
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {totalImages === 0 && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ImageIcon className="w-8 h-8" />
          <span className="text-sm font-medium">Cliquez pour ajouter des images</span>
          <span className="text-xs">JPG, PNG, WEBP, GIF - Max 5MB chacune</span>
        </button>
      )}

      {!canAddMore && totalImages > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Limite de {maxImages} images atteinte
        </p>
      )}
    </div>
  );
}
