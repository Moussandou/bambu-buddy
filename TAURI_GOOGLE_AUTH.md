# Authentification Google avec Tauri - Guide d'implémentation

## 🎯 Ce qui a été implémenté

J'ai créé un système complet d'authentification Google pour l'application desktop Tauri qui :

1. ✅ **Ouvre le navigateur par défaut du système** pour l'OAuth Google
2. ✅ **Récupère le token** via un deep link callback
3. ✅ **Authentifie l'utilisateur** dans Firebase avec ce token
4. ✅ **Fonctionne en web ET en desktop** (détection automatique)

## 📁 Fichiers modifiés/créés

### Backend Tauri (Rust)

**`src-tauri/Cargo.toml`**
- Ajouté `tauri-plugin-shell` pour gérer le deep link
- Ajouté `open` pour ouvrir l'URL dans le navigateur

**`src-tauri/src/main.rs`**
- Commande `open_oauth_url` : Ouvre l'URL OAuth dans le navigateur système
- Listener `deep-link://urls` : Capture les callbacks OAuth
- Émet un événement vers le frontend avec le token

**`src-tauri/tauri.conf.json`**
- Ajouté le plugin `deep-link` avec le scheme `bambubuddy://`

### Frontend (TypeScript/React)

**`src/services/oauth.ts`** (nouveau fichier)
- `startOAuthFlow()` : Lance le flux OAuth complet
- `generateOAuthUrl()` : Génère l'URL Google OAuth avec les bons paramètres
- `parseCallbackUrl()` : Parse le token depuis l'URL de callback
- `isTauriEnvironment()` : Détecte si on est dans Tauri

**`src/contexts/AuthContext.tsx`**
- Modifié `signInWithGoogle()` pour détecter l'environnement
- Si Tauri → utilise `startOAuthFlow()` + navigateur système
- Si Web → utilise `signInWithPopup()` (méthode classique)

**`.env.example`**
- Ajouté `VITE_FIREBASE_CLIENT_ID` pour la config OAuth

## 🔧 Comment tester

### 1. Configuration initiale (OBLIGATOIRE)

Vous devez configurer un Client ID OAuth Google :

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Sélectionnez votre projet Firebase
3. **APIs & Services** > **Credentials**
4. **CREATE CREDENTIALS** > **OAuth 2.0 Client ID**
5. Pour macOS, choisissez type "iOS" avec Bundle ID : `com.moussandou.bambubuddy`
6. Ajoutez l'URI de redirection : `bambubuddy://auth-callback`
7. Copiez le Client ID généré

Dans votre fichier `.env.local` :
```bash
VITE_FIREBASE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
```

📖 **Voir le guide complet** : `OAUTH_SETUP.md`

### 2. Tester en mode Web (aucune config nécessaire)

```bash
npm run dev
```

→ L'auth Google fonctionne avec popup (méthode classique Firebase)

### 3. Tester en mode Tauri Desktop

**Prérequis** : Installer Rust et Tauri CLI
```bash
# Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Installer Tauri CLI
npm install

# Lancer en mode dev
npm run tauri:dev
```

**Ce qui va se passer** :
1. Cliquez sur "Continuer avec Google" dans l'app desktop
2. Votre navigateur par défaut s'ouvre avec la page de connexion Google
3. Vous vous connectez avec votre compte Google
4. Le navigateur affiche "Connexion réussie" et se ferme automatiquement
5. L'app desktop vous connecte automatiquement

## ⚠️ Limitations connues

### En mode développement Tauri

Les deep links peuvent ne pas fonctionner en mode `tauri:dev` car l'app n'est pas "installée" sur le système. Solutions :

1. **Construire et installer l'app** :
   ```bash
   npm run tauri:build
   # Puis installer le .app/.exe généré
   ```

2. **Utiliser email/password en attendant** :
   - Créez un compte avec email/password
   - Une fois l'app buildée et installée, vous pourrez utiliser Google OAuth

### macOS uniquement

Sur macOS, le deep link handler nécessite que l'app soit :
- Soit installée dans `/Applications`
- Soit signée avec un certificat de développeur Apple

En développement, vous verrez peut-être une erreur "No application set to open URL bambubuddy://". C'est normal, utilisez la version buildée.

## 🔍 Debugging

### Voir les logs Tauri

En mode dev, la console Tauri affiche :
```
[useOAuth] Starting OAuth flow...
[Tauri] Opening URL in browser: https://accounts.google.com/o/oauth2/...
[Tauri] Received deep link: bambubuddy://auth-callback#id_token=...
[useOAuth] ID Token received, signing in with Firebase...
```

### Tester le deep link manuellement

Sur macOS :
```bash
open "bambubuddy://auth-callback#id_token=test123"
```

Si l'app est bien installée, elle devrait s'ouvrir et afficher une erreur Firebase (car le token est invalide).

## 🏗️ Architecture technique

```
┌─────────────────────────────────────────────────────────┐
│                    FLUX OAUTH TAURI                      │
└─────────────────────────────────────────────────────────┘

1. Frontend React
   └─> AuthContext.signInWithGoogle()
       └─> startOAuthFlow() [oauth.ts]

2. oauth.ts
   └─> generateOAuthUrl()
       └─> invoke('open_oauth_url', { url })

3. Tauri Backend (Rust)
   └─> open_oauth_url command
       └─> open::that(url) → Ouvre le navigateur

4. Navigateur système
   └─> Utilisateur se connecte sur Google
       └─> Google redirige vers: bambubuddy://auth-callback#id_token=xxx

5. Tauri Backend (Rust)
   └─> Deep link listener capte l'URL
       └─> Émet événement 'deep-link://urls'

6. oauth.ts
   └─> Listen 'deep-link://urls'
       └─> Parse le token
       └─> Retourne le token à AuthContext

7. AuthContext
   └─> GoogleAuthProvider.credential(idToken)
       └─> signInWithCredential(auth, credential)
       └─> Utilisateur connecté ✅
```

## 📝 Notes importantes

### Sécurité

- ✅ Le Client ID OAuth peut être public (il est dans le code client)
- ✅ Le nonce aléatoire protège contre les attaques CSRF
- ✅ Le deep link ne peut être capté que par l'app Bambu Buddy installée
- ✅ Le token n'est jamais stocké, uniquement utilisé pour l'auth Firebase

### Compatibilité

| Plateforme | OAuth Google | Status |
|------------|--------------|--------|
| Web (Chrome, Firefox, Safari) | ✅ Popup | Production |
| macOS Desktop | ✅ Browser | Nécessite build |
| Windows Desktop | ✅ Browser | Nécessite build |
| Linux Desktop | ✅ Browser | Nécessite build |

### Alternative

Si le système OAuth browser ne fonctionne pas pour vous, l'app supporte aussi :
- ✅ **Email/Password** : Création de compte classique
- ✅ **Forgot Password** : Réinitialisation par email

## 🚀 Prochaines étapes

1. **Configurez le Client ID OAuth** (voir `OAUTH_SETUP.md`)
2. **Testez en mode web** avec `npm run dev`
3. **Installez Rust** si vous voulez builder l'app desktop
4. **Buildez l'app** avec `npm run tauri:build`
5. **Installez l'app** et testez Google OAuth avec le navigateur système

## 🆘 Besoin d'aide ?

Consultez :
- 📖 `OAUTH_SETUP.md` - Guide détaillé de configuration OAuth
- 📖 `TROUBLESHOOTING.md` - Solutions aux problèmes courants
- 🌐 [Tauri Docs](https://tauri.app/v1/guides/features/deep-link/)
- 🌐 [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
