<div align="center">

# 🎨 Bambu Buddy

**L'application tout-en-un pour gérer votre activité d'impression 3D**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/moussandou/bambu-buddy)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Tauri](https://img.shields.io/badge/Tauri-2.5-ffc131.svg?logo=tauri)](https://tauri.app)

[🌐 Version Web](#) • [🍎 macOS](#) • [🪟 Windows](#) • [📖 Documentation](#features)

</div>

---

## ✨ Fonctionnalités

### 📦 **Gestion de Stock**
- Suivi en temps réel de vos filaments
- Alertes de stock bas
- Historique des achats et consommations
- Gestion des couleurs et matériaux

### 🖨️ **Gestion des Impressions**
- Bibliothèque de modèles organisée
- Calcul automatique des coûts (filament + électricité)
- Suivi du temps d'impression
- États personnalisables (à faire, en cours, terminé, vendu)

### 📊 **Statistiques & Analyses**
- Dashboard complet avec KPI
- Graphiques de revenus mensuels
- Analyse du ROI par projet
- Export PDF, Excel, CSV

### 💰 **Gestion Financière**
- Calcul automatique du profit
- Suivi du chiffre d'affaires
- Gestion multi-devises (EUR, USD, GBP, etc.)
- Historique des ventes

### 🎯 **Fonctionnalités Pro**
- **PWA (Progressive Web App)** - Fonctionne hors ligne
- **Notifications push** - Alertes pour impressions terminées
- **Mode sombre** - Confort visuel
- **Multi-plateforme** - Web, Desktop (macOS, Windows)
- **Sécurité** - Authentification Firebase, données chiffrées

---

## 🚀 Installation Rapide

### Version Web (Recommandée)

Accédez directement à l'application web : **[bambu-buddy.web.app](#)** *(lien à venir)*

### Version Desktop

#### macOS
```bash
# Téléchargez le fichier .dmg depuis Releases
# Ou installez via Homebrew (à venir)
brew install --cask bambu-buddy
```

#### Windows
```bash
# Téléchargez le fichier .exe ou .msi depuis Releases
# Double-cliquez pour installer
```

---

## 🛠️ Développement Local

### Prérequis

- **Node.js** 20.x ou supérieur
- **npm** ou **yarn**
- **Rust** 1.70+ (pour Tauri desktop)
- **Firebase Project** (pour l'authentification et la base de données)

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/moussandou/bambu-buddy.git
cd bambu-buddy

# 2. Installer les dépendances
npm install

# 3. Configurer Firebase
cp .env.example .env.local
# Éditer .env.local avec vos credentials Firebase

# 4. Lancer en mode développement (Web)
npm run dev

# 5. Lancer en mode développement (Desktop)
npm run tauri:dev
```

### Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build de production (web app) |
| `npm run preview` | Prévisualiser le build de production |
| `npm run tauri:dev` | Lancer l'application desktop en dev |
| `npm run tauri:build` | Build de l'application desktop |
| `npm run deploy:rules` | Déployer les règles Firebase |
| `npm run deploy:indexes` | Déployer les index Firestore |

---

## 📁 Structure du Projet

```
bambu-buddy/
├── src/                      # Code source React
│   ├── components/          # Composants réutilisables
│   ├── contexts/            # Contextes React (Auth, etc.)
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Configuration (Firebase, etc.)
│   ├── pages/               # Pages de l'application
│   ├── services/            # Services (export PDF, etc.)
│   └── types/               # Types TypeScript
├── src-tauri/               # Code Rust pour Tauri
├── public/                  # Assets statiques
├── firestore.rules          # Règles de sécurité Firestore
├── storage.rules            # Règles de sécurité Cloud Storage
├── firebase.json            # Configuration Firebase
└── vite.config.ts           # Configuration Vite
```

---

## 🔐 Configuration Firebase

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Créez un nouveau projet
3. Activez **Authentication** (Email/Password et Google OAuth)
4. Activez **Firestore Database**
5. Activez **Cloud Storage**

### 2. Récupérer les credentials

Dans les paramètres du projet Firebase, copiez la configuration web :

```bash
# .env.local
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Déployer les règles de sécurité

```bash
# Installer Firebase CLI
npm install -g firebase-tools
firebase login

# Déployer règles et index
npm run deploy:rules
npm run deploy:indexes
```

---

## 🎨 Stack Technique

### Frontend
- **React 19** - Framework UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Graphiques
- **React Router** - Navigation

### Backend & Services
- **Firebase Auth** - Authentification
- **Firestore** - Base de données NoSQL
- **Cloud Storage** - Stockage d'images
- **Firebase Hosting** - Hébergement web

### Desktop
- **Tauri 2** - Framework multi-plateforme
- **Rust** - Backend natif

### Outils
- **Vite** - Build tool ultra-rapide
- **ESLint** - Linter JavaScript/TypeScript
- **jsPDF** - Export PDF
- **xlsx** - Export Excel

---

## 📸 Screenshots

### Dashboard Principal
*Coming soon - Screenshot du dashboard avec les statistiques*

### Gestion du Stock
*Coming soon - Screenshot de la page de gestion des filaments*

### Statistiques
*Coming soon - Screenshot de la page statistiques avec graphiques*

---

## 🚢 Déploiement

### Firebase Hosting (Recommandé)

```bash
# Build de production
npm run build

# Déployer sur Firebase Hosting
firebase deploy --only hosting
```

### Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### GitHub Pages

⚠️ **Note**: GitHub Pages nécessite une configuration spéciale pour React Router.

```bash
# Ajouter dans vite.config.ts
base: '/bambu-buddy/'

# Build et déployer
npm run build
gh-pages -d dist
```

### Build Desktop

#### macOS

```bash
# Prérequis
xcode-select --install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Build
npm run tauri:build

# Sortie dans: src-tauri/target/release/bundle/macos/
```

#### Windows

```bash
# Prérequis: Visual Studio Build Tools + WebView2
# https://tauri.app/v1/guides/getting-started/prerequisites#windows

# Build
npm run tauri:build

# Sortie dans: src-tauri/target/release/bundle/
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Guidelines

- Code en TypeScript avec typage strict
- Suivre les conventions de code (ESLint)
- Ajouter des tests si applicable
- Documenter les nouvelles fonctionnalités

---

## 🐛 Bugs & Fonctionnalités

Vous avez trouvé un bug ou souhaitez suggérer une fonctionnalité ?

👉 [Ouvrir une issue](https://github.com/moussandou/bambu-buddy/issues)

---

## 📄 License

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- [Bambu Lab](https://bambulab.com) pour l'inspiration du nom
- [Firebase](https://firebase.google.com) pour les services backend
- [Tauri](https://tauri.app) pour le framework desktop
- La communauté open-source

---

<div align="center">

**Fait avec ❤️ par [Moussandou](https://github.com/moussandou)**

[⬆ Retour en haut](#-bambu-buddy)

</div>
