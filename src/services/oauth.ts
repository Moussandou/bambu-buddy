// ============================================
// OAuth Service for Tauri - Browser-based flow
// ============================================

import { invoke } from '@tauri-apps/api/core';

/**
 * Configuration OAuth pour Google
 */
const OAUTH_CONFIG = {
  clientId: import.meta.env.VITE_FIREBASE_CLIENT_ID || '',
  redirectUri: 'http://localhost:8765/callback',
  scope: 'openid email profile',
  responseType: 'token id_token',
};

/**
 * Génère l'URL d'autorisation OAuth Google
 */
function generateOAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    response_type: OAUTH_CONFIG.responseType,
    scope: OAUTH_CONFIG.scope,
    nonce: generateNonce(),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Génère un nonce aléatoire pour la sécurité
 */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Parse les paramètres de l'URL de callback
 */
function parseCallbackUrl(url: string): { idToken?: string; accessToken?: string; error?: string } {
  try {
    const hashParams = new URLSearchParams(url.split('#')[1] || '');

    return {
      idToken: hashParams.get('id_token') || undefined,
      accessToken: hashParams.get('access_token') || undefined,
      error: hashParams.get('error') || undefined,
    };
  } catch (error) {
    return { error: 'Failed to parse callback URL' };
  }
}

/**
 * Démarre le flux OAuth avec le navigateur système
 * Utilise un serveur local temporaire pour capturer le callback
 */
export async function startOAuthFlow(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Démarrer un serveur local pour capturer le callback
      const server = await invoke<number>('start_oauth_server');
      console.log('[OAuth] Server started on port:', server);

      // Générer l'URL OAuth et ouvrir le navigateur
      const oauthUrl = generateOAuthUrl();
      console.log('[OAuth] Opening browser with URL:', oauthUrl);
      await invoke('open_oauth_url', { url: oauthUrl });

      // Attendre le résultat du serveur (timeout 5min)
      const timeoutId = setTimeout(() => {
        invoke('stop_oauth_server');
        reject(new Error('OAuth timeout - user did not complete authentication'));
      }, 5 * 60 * 1000);

      // Polling pour vérifier si on a reçu le token
      const checkInterval = setInterval(async () => {
        try {
          const result = await invoke<string | null>('get_oauth_result');

          if (result) {
            clearTimeout(timeoutId);
            clearInterval(checkInterval);
            await invoke('stop_oauth_server');

            const { idToken, error } = parseCallbackUrl(result);

            if (error) {
              reject(new Error(`OAuth error: ${error}`));
            } else if (idToken) {
              resolve(idToken);
            } else {
              reject(new Error('No ID token received'));
            }
          }
        } catch (err) {
          // Continue polling
        }
      }, 500);

    } catch (error) {
      console.error('[OAuth] Error in startOAuthFlow:', error);
      reject(error);
    }
  });
}

/**
 * Vérifie si on est dans l'environnement Tauri
 */
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}
