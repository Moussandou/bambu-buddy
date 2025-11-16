# Guide de Déploiement - Bambu Buddy

Ce guide explique comment déployer Bambu Buddy sur Firebase Hosting et créer des releases GitHub pour les applications desktop.

## 📋 Prérequis

### Outils nécessaires
- [Node.js 20+](https://nodejs.org)
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- [Git](https://git-scm.com)
- [Rust](https://rustup.rs) (pour builds desktop)

### Comptes requis
- Compte Firebase avec le projet `bambu-buddy` configuré
- Compte GitHub avec accès au repository

---

## 🌐 Déploiement Web (Firebase Hosting)

### 1. Configuration initiale (première fois seulement)

```bash
# Connexion à Firebase
firebase login

# Vérifier le projet
firebase projects:list
# Devrait afficher: bambu-buddy

# Vérifier que vous êtes sur le bon projet
firebase use bambu-buddy
```

### 2. Déployer l'application web

```bash
# Option A: Build et déploiement en une commande
npm run deploy:hosting

# Option B: Étapes séparées
npm run build           # Build de production (output: dist/)
firebase deploy --only hosting
```

### 3. Vérifier le déploiement

Après le déploiement, Firebase CLI affichera l'URL :
```
✔  Deploy complete!

Hosting URL: https://bambu-buddy.web.app
```

Testez l'application à cette URL.

### 4. Déployer les règles de sécurité (si modifiées)

```bash
# Déployer Firestore rules et Storage rules
npm run deploy:rules

# Déployer les index Firestore
npm run deploy:indexes

# Ou tout déployer d'un coup
npm run deploy
```

---

## 🖥️ Build Desktop (macOS & Windows)

### macOS

#### Prérequis macOS
```bash
# Installer Xcode Command Line Tools
xcode-select --install

# Accepter la licence Xcode
sudo xcodebuild -license

# Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

#### Build pour macOS
```bash
# Build de production
npm run tauri:build

# Les fichiers sont créés dans:
# src-tauri/target/release/bundle/macos/Bambu Buddy.app
# src-tauri/target/release/bundle/dmg/Bambu Buddy_0.1.0_x64.dmg
```

### Windows

#### Prérequis Windows
1. Installer [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
   - Cocher "Desktop development with C++"
2. Installer [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)
3. Installer [Rust](https://rustup.rs)

#### Build pour Windows
```bash
# Build de production
npm run tauri:build

# Les fichiers sont créés dans:
# src-tauri/target/release/bundle/msi/Bambu Buddy_0.1.0_x64_en-US.msi
# src-tauri/target/release/bundle/nsis/Bambu Buddy_0.1.0_x64-setup.exe
```

---

## 🚀 Releases GitHub (Automatisé)

### Configuration des secrets GitHub

Pour que le workflow GitHub Actions fonctionne, configurez ces secrets dans votre repo :

1. Allez sur `Settings` > `Secrets and variables` > `Actions`
2. Ajoutez les secrets suivants :

| Secret | Description | Comment l'obtenir |
|--------|-------------|-------------------|
| `FIREBASE_SERVICE_ACCOUNT_BAMBU_BUDDY` | Service account Firebase | Voir section ci-dessous |
| `TAURI_PRIVATE_KEY` | Clé privée pour signer les updates | `npx tauri signer generate` |
| `TAURI_KEY_PASSWORD` | Mot de passe de la clé | Généré avec la commande ci-dessus |

#### Obtenir le Firebase Service Account

```bash
# 1. Créer un service account dans Firebase Console
# https://console.firebase.google.com/project/bambu-buddy/settings/serviceaccounts

# 2. Générer une nouvelle clé privée (JSON)
# 3. Copier tout le contenu du fichier JSON
# 4. Coller dans le secret GitHub FIREBASE_SERVICE_ACCOUNT_BAMBU_BUDDY
```

#### Générer les clés Tauri

```bash
# Générer une paire de clés
npx tauri signer generate

# Sauvegarder les valeurs dans GitHub Secrets:
# - TAURI_PRIVATE_KEY: La clé privée
# - TAURI_KEY_PASSWORD: Le mot de passe
```

### Créer une release

#### Option A: Via Git Tags (Recommandé)

```bash
# 1. Mettre à jour la version dans package.json et src-tauri/Cargo.toml
npm version patch  # ou minor, ou major

# 2. Push les changements et le tag
git push && git push --tags

# GitHub Actions va automatiquement:
# - Builder l'app web
# - Déployer sur Firebase Hosting
# - Builder les apps desktop (macOS + Windows)
# - Créer une draft release avec les binaires
```

#### Option B: Manuellement

```bash
# 1. Aller sur GitHub > Actions
# 2. Sélectionner "Build and Deploy"
# 3. Cliquer "Run workflow"
# 4. Choisir la branche "main"
# 5. Cliquer "Run workflow"
```

### Publier la release

1. Allez sur [GitHub Releases](https://github.com/moussandou/bambu-buddy/releases)
2. Vous verrez une "Draft" release créée automatiquement
3. Éditez la release :
   - Vérifiez le changelog
   - Ajoutez des notes de version si nécessaire
   - Cochez "Set as latest release"
4. Cliquez "Publish release"

Les utilisateurs pourront maintenant télécharger :
- `Bambu Buddy_0.1.0_x64.dmg` (macOS Intel)
- `Bambu Buddy_0.1.0_aarch64.dmg` (macOS Apple Silicon)
- `Bambu Buddy_0.1.0_x64-setup.exe` (Windows)
- `Bambu Buddy_0.1.0_x64.msi` (Windows)

---

## 🔍 Vérifications Post-Déploiement

### Web App

- [ ] L'app se charge correctement sur https://bambu-buddy.web.app
- [ ] L'authentification fonctionne (Email/Password + Google OAuth)
- [ ] Les routes fonctionnent (/dashboard, /filaments, /jobs, etc.)
- [ ] Le mode hors ligne fonctionne (Service Worker)
- [ ] Les règles Firebase bloquent les accès non autorisés

### Desktop Apps

- [ ] L'app s'installe correctement
- [ ] L'authentification Firebase fonctionne
- [ ] Les données se synchronisent avec Firestore
- [ ] Les images s'affichent depuis Cloud Storage
- [ ] Les notifications fonctionnent (si supportées)

---

## 🐛 Troubleshooting

### Erreur: "Firebase project not found"

```bash
# Vérifier le projet actif
firebase use

# Basculer vers le bon projet
firebase use bambu-buddy
```

### Erreur: "Permission denied" lors du déploiement

```bash
# Se reconnecter à Firebase
firebase logout
firebase login
```

### Build Tauri échoue sur macOS

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Nettoyer le cache Rust
cd src-tauri
cargo clean
cd ..
```

### GitHub Actions échoue

1. Vérifier que tous les secrets sont bien configurés
2. Vérifier les logs dans l'onglet "Actions"
3. S'assurer que le fichier `.env.example` est bien présent (pour valider les variables requises)

---

## 📝 Checklist de Déploiement

Avant chaque déploiement, vérifier :

### Code
- [ ] Tests passent (`npm run lint`)
- [ ] Build de production réussit (`npm run build`)
- [ ] Pas de secrets hardcodés dans le code
- [ ] `.env.local` est bien dans `.gitignore`

### Firebase
- [ ] Règles Firestore à jour
- [ ] Règles Storage à jour
- [ ] Index Firestore créés
- [ ] Quotas Firebase suffisants

### Version
- [ ] `package.json` version incrémentée
- [ ] `src-tauri/Cargo.toml` version incrémentée
- [ ] CHANGELOG.md mis à jour (si vous en avez un)

### Git
- [ ] Tous les changements commités
- [ ] Branche `main` à jour
- [ ] Tags Git créés si nécessaire

---

## 🔄 Rollback

Si un déploiement pose problème :

### Rollback Web App

```bash
# Lister les déploiements
firebase hosting:releases:list

# Rollback vers une version précédente
firebase hosting:rollback
```

### Rollback Desktop App

1. Supprimer la release problématique sur GitHub
2. Recréer une release avec les binaires d'une version précédente
3. Informer les utilisateurs de downgrader si nécessaire

---

## 📧 Support

En cas de problème :
1. Consulter les logs Firebase Console
2. Consulter les logs GitHub Actions
3. Ouvrir une issue sur GitHub

---

**Fait avec ❤️ pour Bambu Buddy**
