# Configuration OAuth Google pour Tauri

Ce guide explique comment configurer l'authentification Google dans l'application desktop Bambu Buddy.

## Pourquoi cette configuration ?

L'application web utilise Firebase Authentication avec popup Google, mais dans l'app desktop Tauri, les popups ne fonctionnent pas. À la place, on ouvre le navigateur système pour l'authentification OAuth, puis on récupère le token via un deep link.

## Étapes de configuration

### 1. Créer un Client ID OAuth dans Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Sélectionnez votre projet Firebase
3. Dans le menu, allez à **APIs & Services** > **Credentials**
4. Cliquez sur **+ CREATE CREDENTIALS** > **OAuth 2.0 Client ID**
5. Choisissez le type d'application :
   - **macOS** : Sélectionnez "iOS"
   - **Windows** : Sélectionnez "Desktop application"
   - **Linux** : Sélectionnez "Desktop application"

### 2. Configurer les URI de redirection

Dans la configuration du Client ID :

**Bundle ID / Package name (pour macOS iOS type)** :
```
com.moussandou.bambubuddy
```

**Authorized redirect URIs** :
```
bambubuddy://auth-callback
```

### 3. Récupérer le Client ID

Une fois créé, copiez le **Client ID** (format : `xxxxx.apps.googleusercontent.com`)

### 4. Configurer les variables d'environnement

Créez ou modifiez le fichier `.env.local` :

```bash
# ... autres variables Firebase ...

# OAuth Configuration pour Tauri
VITE_FIREBASE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Remplacez `your-client-id.apps.googleusercontent.com` par votre vrai Client ID.

### 5. Configurer Firebase Console

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet
3. Allez dans **Authentication** > **Sign-in method**
4. Dans **Google**, cliquez sur l'icône du crayon (éditer)
5. Ajoutez votre Client ID OAuth dans **Web SDK configuration**

## Comment ça fonctionne ?

### Version Web
1. L'utilisateur clique sur "Continuer avec Google"
2. Une popup Firebase s'ouvre
3. L'utilisateur s'authentifie
4. La popup se ferme et renvoie le token

### Version Desktop (Tauri)
1. L'utilisateur clique sur "Continuer avec Google"
2. Le navigateur par défaut du système s'ouvre avec l'URL OAuth Google
3. L'utilisateur s'authentifie dans son navigateur
4. Google redirige vers `bambubuddy://auth-callback?id_token=...`
5. L'app desktop capture ce deep link
6. Le token est utilisé pour authentifier l'utilisateur dans Firebase

## Structure du code

### Frontend (React)
- **`src/services/oauth.ts`** : Gestion du flux OAuth avec le navigateur système
- **`src/contexts/AuthContext.tsx`** : Détection Tauri et choix de la méthode d'auth

### Backend (Rust/Tauri)
- **`src-tauri/src/main.rs`** :
  - Commande `open_oauth_url` pour ouvrir le navigateur
  - Listener pour les deep links `bambubuddy://`
- **`src-tauri/tauri.conf.json`** : Configuration du deep link scheme

## Tester localement

### Mode développement web
```bash
npm run dev
```
→ Utilise la méthode popup (aucune config OAuth nécessaire)

### Mode développement Tauri
```bash
npm run tauri:dev
```
→ Utilise le navigateur système (nécessite la config OAuth)

## Troubleshooting

### Le navigateur ne s'ouvre pas
- Vérifiez que le plugin `tauri-plugin-shell` est bien installé
- Vérifiez les logs de la console Tauri

### Le deep link ne fonctionne pas
- Sur macOS : L'app doit être construite et installée pour enregistrer le URL scheme
- En dev : Certains deep links peuvent ne pas fonctionner, utilisez email/password
- Vérifiez que `bambubuddy://` est bien configuré dans `tauri.conf.json`

### Erreur "Client ID not found"
- Vérifiez que `VITE_FIREBASE_CLIENT_ID` est dans `.env.local`
- Redémarrez le serveur de dev après avoir ajouté la variable

### L'authentification échoue
- Vérifiez que le Client ID OAuth correspond bien à celui dans Google Cloud Console
- Vérifiez que `bambubuddy://auth-callback` est dans les redirect URIs autorisées
- Regardez les logs de la console pour voir le token reçu

## Notes de sécurité

- Le Client ID OAuth peut être public (il est dans le code de l'app)
- Le deep link `bambubuddy://` ne peut être intercepté que par l'app Bambu Buddy
- Le nonce aléatoire protège contre les attaques CSRF
- Les tokens sont uniquement stockés en mémoire, jamais persistés

## Ressources

- [Tauri Deep Links](https://tauri.app/v1/guides/features/deep-link/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Firebase Auth with Custom Tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens)
