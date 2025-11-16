/**
 * Service de notifications PWA pour Bambu Buddy
 */

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

/**
 * Vérifie si les notifications sont supportées par le navigateur
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Récupère le statut actuel des permissions de notification
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return { granted: false, denied: true, default: false };
  }

  const permission = Notification.permission;
  return {
    granted: permission === 'granted',
    denied: permission === 'denied',
    default: permission === 'default',
  };
}

/**
 * Demande la permission d'envoyer des notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface ShowNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
}

/**
 * Affiche une notification
 */
export async function showNotification(options: ShowNotificationOptions): Promise<void> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return;
  }

  // Demander la permission si pas encore accordée
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    // Utiliser le service worker si disponible (meilleur pour PWA)
    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/icon-192.png',
      badge: options.badge || '/icon-192.png',
      tag: options.tag,
      requireInteraction: options.requireInteraction || false,
      data: options.data,
      actions: options.actions as NotificationAction[] | undefined,
      vibrate: [200, 100, 200],
    } as NotificationOptions);
  } catch (error) {
    console.error('Error showing notification:', error);

    // Fallback vers notification basique si service worker fail
    if (Notification.permission === 'granted') {
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192.png',
        tag: options.tag,
        data: options.data,
      });
    }
  }
}

/**
 * Notifications spécifiques pour Bambu Buddy
 */

export async function notifyPrintComplete(jobTitle: string, jobId: string): Promise<void> {
  await showNotification({
    title: '🎉 Impression terminée !',
    body: `"${jobTitle}" est terminé`,
    tag: `job-complete-${jobId}`,
    requireInteraction: true,
    data: { jobId, type: 'print-complete' },
    actions: [
      {
        action: 'view',
        title: 'Voir',
      },
      {
        action: 'dismiss',
        title: 'OK',
      },
    ],
  });
}

export async function notifyLowStock(filamentName: string, remaining: number): Promise<void> {
  await showNotification({
    title: '⚠️ Stock faible',
    body: `${filamentName}: ${remaining}g restants`,
    tag: 'low-stock',
    data: { type: 'low-stock', filamentName, remaining },
  });
}

export async function notifyPrintProgress(jobTitle: string, progress: number): Promise<void> {
  // Notification silencieuse qui se met à jour
  await showNotification({
    title: `🖨️ En cours: ${jobTitle}`,
    body: `Progression: ${progress}%`,
    tag: `print-progress-${jobTitle}`, // Même tag = remplace notification
    requireInteraction: false,
    data: { type: 'print-progress', progress },
  });
}
