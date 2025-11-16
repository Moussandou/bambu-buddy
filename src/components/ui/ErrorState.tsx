import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorState({
  message = 'Une erreur est survenue lors du chargement des données',
  onRetry,
  fullScreen = false,
}: ErrorStateProps) {
  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="rounded-full bg-red-50 dark:bg-red-900/20 p-6 mb-4">
        <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Erreur
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          icon={<RefreshCw className="w-4 h-4" />}
          variant="secondary"
        >
          Réessayer
        </Button>
      )}
    </div>
  );
}
