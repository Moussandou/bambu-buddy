import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showNotification,
} from '../../services/notifications';

export function NotificationSettings() {
  const [permission, setPermission] = useState(getNotificationPermission());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Écouter les changements de permission
    const checkPermission = () => {
      setPermission(getNotificationPermission());
    };

    // Vérifier périodiquement
    const interval = setInterval(checkPermission, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        setPermission(getNotificationPermission());
        // Test notification
        await showNotification({
          title: '✅ Notifications activées !',
          body: 'Vous recevrez des alertes pour vos impressions terminées.',
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    await showNotification({
      title: '🧪 Test de notification',
      body: 'Si vous voyez ce message, les notifications fonctionnent !',
    });
  };

  if (!isNotificationSupported()) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BellOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
              Notifications non supportées
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Votre navigateur ne supporte pas les notifications push. Utilisez un navigateur moderne comme Chrome, Firefox ou Edge.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Notifications push
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Recevez des alertes quand vos impressions sont terminées
        </p>
      </div>

      {permission.granted ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 dark:text-green-100">
                Notifications activées
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Vous recevrez des notifications pour vos impressions terminées.
              </p>
              <Button
                onClick={handleTestNotification}
                variant="secondary"
                className="mt-3"
              >
                Tester les notifications
              </Button>
            </div>
          </div>
        </div>
      ) : permission.denied ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <BellOff className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100">
                Notifications bloquées
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Vous avez bloqué les notifications. Pour les activer :
              </p>
              <ol className="text-sm text-red-700 dark:text-red-300 mt-2 ml-4 list-decimal">
                <li>Cliquez sur l'icône de cadenas dans la barre d'adresse</li>
                <li>Trouvez "Notifications" et sélectionnez "Autoriser"</li>
                <li>Rechargez la page</li>
              </ol>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Activer les notifications
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Soyez alerté dès qu'une impression est terminée. Vous pouvez désactiver les notifications à tout moment.
              </p>
              <Button
                onClick={handleEnableNotifications}
                isLoading={loading}
                className="mt-3"
              >
                Activer les notifications
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <strong>À propos des notifications :</strong>
        <ul className="mt-1 ml-4 list-disc space-y-1">
          <li>Fonctionnent même quand l'application est fermée (PWA uniquement)</li>
          <li>Alertes pour impressions terminées (à 100%)</li>
          <li>Aucun spam - seulement les événements importants</li>
          <li>Respecte votre vie privée - aucune donnée partagée</li>
        </ul>
      </div>
    </div>
  );
}
