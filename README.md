# Bambu Buddy - Gestionnaire d'Impressions 3D

Application web pour gérer tes impressions 3D, ton inventaire de filaments, tes ventes et ton portefeuille financier.

## Fonctionnalités

- **Dashboard** : Vue d'ensemble avec KPIs (ventes, bénéfice, stock, impressions actives)
- **Gestion Filaments** : Inventaire avec suivi du poids restant, coûts, et alertes stock bas
- **Impressions** : Vue Kanban des jobs (en impression → fini → en vente → vendu)
- **Ventes** : Historique et suivi des ventes avec calcul automatique du profit
- **Portefeuille** : Suivi financier (ventes vs coûts matière)
- **Calcul automatique** : Coût filament par impression (grammes × prix/kg)
- **Mode hors ligne** : Fonctionne offline grâce à Firebase persistence
- **Thème dark/light** : Interface moderne avec Tailwind CSS

## Stack Technique

- **Frontend** : React + TypeScript + Vite
- **Styling** : Tailwind CSS
- **Backend** : Firebase (Auth + Firestore + Storage)
- **Router** : React Router v6
- **State** : React Context
- **Icons** : Lucide React
- **Charts** : Recharts (à venir)

## Installation

### 1. Cloner et installer les dépendances

```bash
npm install
```

### 2. Configuration Firebase

1. Crée un projet Firebase sur [console.firebase.google.com](https://console.firebase.google.com)
2. Active **Authentication** (Email/Password + Google)
3. Crée une base de données **Firestore** (mode production)
4. Active **Storage** pour les images
5. Récupère ta config Firebase depuis **Project Settings > Your apps**

### 3. Variables d'environnement

Copie `.env.example` en `.env.local` et remplis les valeurs :

```bash
cp .env.example .env.local
```

Édite `.env.local` avec ta config Firebase :

```env
VITE_FIREBASE_API_KEY=ta-clé-api
VITE_FIREBASE_AUTH_DOMAIN=ton-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ton-projet-id
VITE_FIREBASE_STORAGE_BUCKET=ton-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Déployer les règles de sécurité

**Firestore Rules** : Va dans Firebase Console > Firestore Database > Rules et colle le contenu de `firestore.rules`

**Storage Rules** : Va dans Firebase Console > Storage > Rules et colle le contenu de `storage.rules`

### 5. Créer les index Firestore (IMPORTANT ⚠️)

Les requêtes nécessitent des index composites. **Deux options** :

**Option A - Automatique (Recommandé)** :
```bash
npm install -g firebase-tools
firebase login
firebase init firestore  # Sélectionner votre projet
firebase deploy --only firestore:indexes
```

**Option B - Manuel** :
- Lance l'app et clique sur les liens d'erreur dans la console
- OU voir le guide complet dans `FIREBASE_INDEXES_SETUP.md`

⏱️ Les index prennent 2-5 minutes à se créer.

### 6. Lancer l'app en développement

```bash
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173)

## Structure du Projet

```
src/
├── components/
│   ├── layout/          # Sidebar, Layout
│   └── ui/              # Composants réutilisables (Card, Button, Badge, etc.)
├── contexts/            # AuthContext
├── hooks/               # Hooks custom (useFirestore)
├── lib/                 # Firebase config
├── pages/               # Pages (Dashboard, Filaments, Jobs, etc.)
├── services/            # Services Firebase (CRUD)
├── types/               # Types TypeScript
├── utils/               # Utilitaires (calculs, formatage)
├── App.tsx              # Router principal
└── main.tsx             # Point d'entrée
```

## Formules de Calcul

### Coût Filament

```
coût = (grammes_utilisés / 1000) × prix_par_kg
```

**Exemple** : 33g à 16€/kg
- 33 / 1000 = 0.033 kg
- 0.033 × 16 = 0.528€
- Arrondi : **0.53€**

### Profit

```
profit = prix_de_vente - coût_total_filament
```

## Modèle de Données

### Collections Firestore

- **users** : Profils utilisateurs
- **filaments** : Inventaire de filaments
- **jobs** : Impressions/objets
- **sales** : Ventes
- **transactions** : Transactions financières
- **inventoryTransactions** : Historique mouvements stock

Voir `src/types/index.ts` pour les interfaces complètes.

## Fonctionnalités à Implémenter (v2)

- [ ] Page Filaments complète (CRUD + consommation)
- [ ] Vue Kanban drag & drop pour Jobs
- [ ] Page Ventes avec filtres et export CSV
- [ ] Portefeuille avec graphiques (recharts)
- [ ] Upload images (Firebase Storage)
- [ ] Multi-filament par impression
- [ ] Export/Import JSON/CSV
- [ ] Notifications stock bas
- [ ] PWA (install sur Mac/mobile)
- [ ] Intégration Stripe (optionnel)
- [ ] Mode dark/light toggle

## Scripts Disponibles

```bash
npm run dev          # Dev server
npm run build        # Build production
npm run preview      # Preview build
npm run lint         # ESLint
npm run tauri:dev    # Lance la fenêtre Tauri en mode dev
npm run tauri:build  # Build macOS (.app + .dmg)
```

## Déploiement

### Firebase Hosting

```bash
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Autres options
- **Vercel** : `vercel`
- **Netlify** : `netlify deploy`

## Packaging Desktop (Tauri)

### Prérequis (macOS)
- Xcode + Command Line Tools (`xcode-select --install`)
- Rust toolchain (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
- Licence Xcode acceptée (`sudo xcodebuild -license`)

### Lancer en mode desktop
```bash
npm install            # installe aussi le CLI Tauri
npm run tauri:dev      # ouvre la fenêtre native
```

### Builder l'app .app / .dmg
```bash
npm run build          # build Vite (dist/)
npm run tauri:build    # génère src-tauri/target/release/bundle/macos/
```

Les icônes se configurent via `src-tauri/tauri.conf.json`. Tu peux générer les formats requis avec :
```bash
npx tauri icon public/icon.png
```
*(fournis d'abord une icône carrée 1024x1024).* 

## Support

Pour toute question ou bug :
1. Vérifie que Firebase est correctement configuré
2. Vérifie les règles Firestore/Storage
3. Regarde la console navigateur pour les erreurs

## Licence

Projet personnel - Tous droits réservés

---

Fait avec ❤️ pour gérer tes impressions 3D comme un pro !
