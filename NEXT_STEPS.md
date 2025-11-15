# Prochaines Étapes - Roadmap de Développement

Voici les fonctionnalités à implémenter pour finaliser Bambu Buddy.

## ✅ Déjà Fait (MVP Foundation)

- [x] Configuration projet (React + TypeScript + Tailwind + Vite)
- [x] Firebase setup (Auth + Firestore + Storage)
- [x] Règles de sécurité Firestore et Storage
- [x] Modèle de données complet (types TypeScript)
- [x] Services Firebase (CRUD filaments, jobs)
- [x] Composants UI réutilisables (Card, Badge, Button, Input, Modal, etc.)
- [x] Système d'authentification (Email/Password + Google)
- [x] Layout et Navigation (Sidebar)
- [x] Dashboard avec KPIs en temps réel
- [x] Calculs automatiques (coût filament, profit)
- [x] Documentation (README + Firebase Setup)

## 🚧 À Implémenter (par priorité)

### 1. Page Filaments (Haute Priorité)

**Fichier** : `src/pages/Filaments.tsx`

Fonctionnalités :
- [ ] Liste des filaments avec barres de progression (stock restant)
- [ ] Formulaire d'ajout filament (Modal)
  - Nom, couleur (color picker), poids initial, prix/kg, fournisseur
- [ ] Formulaire d'édition filament
- [ ] Bouton "Consommer" pour réduire le stock manuellement
- [ ] Bouton "Ajouter stock" (nouvelle bobine)
- [ ] Filtres par couleur / fournisseur
- [ ] Tri (par stock restant, prix, nom)
- [ ] Alertes visuelles pour stock < 25%

**Composants à créer** :
- `FilamentCard.tsx` (affichage d'un filament)
- `FilamentForm.tsx` (formulaire add/edit)
- `ColorPicker.tsx` (sélecteur de couleur)

**Hooks** :
- `useFilaments.ts` (logique CRUD + consommation)

**Temps estimé** : 4-6h

---

### 2. Page Jobs/Impressions - Vue Kanban (Haute Priorité)

**Fichier** : `src/pages/Jobs.tsx`

Fonctionnalités :
- [ ] Vue Kanban (4 colonnes : en impression | fini | en vente | vendu)
- [ ] Drag & drop entre colonnes (library: `dnd-kit` ou `react-beautiful-dnd`)
- [ ] Formulaire d'ajout job (Modal)
  - Titre, description, sélection filament(s), grammes, prix vente, tags
  - Upload image (Firebase Storage)
- [ ] Vue détail job (Modal ou page dédiée)
  - Images, info filament, coût calculé, profit
- [ ] Bouton "Marquer comme vendu" (crée vente automatiquement)
- [ ] Filtres par état, tags
- [ ] Recherche par titre

**Composants à créer** :
- `JobCard.tsx` (affichage carte job)
- `JobForm.tsx` (formulaire add/edit)
- `JobDetail.tsx` (vue détaillée)
- `KanbanBoard.tsx` (board drag & drop)
- `ImageUpload.tsx` (upload vers Storage)

**Services à compléter** :
- `src/services/storage.ts` (upload/delete images)

**Temps estimé** : 6-8h

---

### 3. Page Ventes (Moyenne Priorité)

**Fichier** : `src/pages/Sales.tsx`

Fonctionnalités :
- [ ] Liste des ventes avec détails (job, prix, date, profit)
- [ ] Filtres par période (ce mois, mois dernier, custom range)
- [ ] Total ventes par période
- [ ] Export CSV (toutes les ventes)
- [ ] Vue détail vente (lien vers job)
- [ ] Graphique ventes par mois (recharts)

**Composants à créer** :
- `SalesTable.tsx` (tableau ventes)
- `SalesChart.tsx` (graphique)
- `DateRangePicker.tsx` (sélection période)

**Utils** :
- `src/utils/export.ts` (export CSV/JSON)

**Temps estimé** : 3-4h

---

### 4. Page Portefeuille (Moyenne Priorité)

**Fichier** : `src/pages/Wallet.tsx`

Fonctionnalités :
- [ ] KPI : Total ventes, Total coûts, Bénéfice net
- [ ] Graphique donut (ventes vs coûts)
- [ ] Liste des transactions (ventes, dépenses, retraits)
- [ ] Bouton "Retirer fonds" (mark transactions as withdrawn, visuel seulement)
- [ ] Ajout dépenses manuelles (autres que filament)
- [ ] Export transactions

**Composants à créer** :
- `TransactionList.tsx`
- `WalletChart.tsx` (donut chart)
- `AddExpenseForm.tsx`

**Temps estimé** : 3-4h

---

### 5. Page Paramètres (Basse Priorité)

**Fichier** : `src/pages/Settings.tsx`

Fonctionnalités :
- [ ] Profil utilisateur (nom, email, photo)
- [ ] Choix de devise (EUR, USD, etc.)
- [ ] Export complet de données (JSON)
- [ ] Import données (JSON)
- [ ] Sauvegarde manuelle (download backup)
- [ ] Thème dark/light toggle
- [ ] Langue (optionnel)

**Temps estimé** : 2-3h

---

### 6. Améliorations UI/UX

- [ ] Loading states (skeletons pendant chargement Firestore)
- [ ] Error states (affichage erreurs Firebase)
- [ ] Empty states (messages quand pas de données)
- [ ] Toasts/Notifications (succès, erreurs)
  - Library : `react-hot-toast` ou `sonner`
- [ ] Animations (framer-motion optionnel)
- [ ] Responsive mobile (vérifier toutes les pages)
- [ ] Dark mode complet (persister choix dans localStorage)

**Temps estimé** : 4-5h

---

### 7. PWA (Progressive Web App)

**Fonctionnalités** :
- [ ] Manifest.json (icônes, nom, couleurs)
- [ ] Service Worker (cache offline)
- [ ] Installable sur Mac/iPhone/Android
- [ ] Notifications push (optionnel, Firebase Cloud Messaging)

**Setup** :
- Vite plugin : `vite-plugin-pwa`
- Générer icônes (512x512, 192x192, etc.)

**Temps estimé** : 2-3h

---

### 8. Tests (Optionnel)

- [ ] Tests unitaires (Vitest)
  - Utilitaires de calcul (`calculations.ts`)
  - Composants UI (React Testing Library)
- [ ] Tests E2E (Playwright ou Cypress)
  - Flow complet : login → add filament → create job → mark sold

**Temps estimé** : 6-8h

---

### 9. Fonctionnalités Avancées (v2)

- [ ] Multi-utilisateurs (partage portofolio)
- [ ] Intégration Stripe (encaissement en ligne)
- [ ] Catalogue public (vente en ligne)
- [ ] OctoPrint integration (contrôle imprimante)
- [ ] Suivi coût électrique par impression
- [ ] QR codes pour inventaire
- [ ] Statistiques avancées (heatmap, trends)
- [ ] Mode multi-imprimante
- [ ] Notifications stock bas (email ou push)

---

## Ordre Recommandé (MVP Complet)

1. **Filaments page** → Pour gérer l'inventaire
2. **Jobs page** → Pour créer et suivre impressions
3. **Ventes page** → Pour voir historique et stats
4. **Wallet page** → Pour vision financière
5. **Settings** → Pour personnalisation
6. **UI/UX polish** → Loading, errors, responsive
7. **PWA** → Pour install sur desktop/mobile

**Temps total estimé MVP complet** : ~25-35h (selon expérience)

---

## Comment Contribuer / Développer

1. **Choisir une tâche** (commence par Filaments)
2. **Créer une branche** : `git checkout -b feature/filaments-page`
3. **Coder** en suivant la structure existante
4. **Tester** localement
5. **Commit** : `git commit -m "feat: add filaments CRUD"`
6. **Merger** dans main quand fini

---

## Ressources Utiles

### Libraries à ajouter (selon besoin)

```bash
# Drag & Drop
npm install @dnd-kit/core @dnd-kit/sortable

# Charts
npm install recharts

# Notifications
npm install sonner

# Date picker
npm install react-day-picker date-fns

# Export CSV
npm install papaparse
npm install -D @types/papaparse

# PWA
npm install -D vite-plugin-pwa

# Color picker
npm install react-colorful
```

### Documentation

- [Firestore Queries](https://firebase.google.com/docs/firestore/query-data/queries)
- [Storage Upload](https://firebase.google.com/docs/storage/web/upload-files)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [dnd-kit Tutorial](https://docs.dndkit.com/)

---

Bonne chance et amuse-toi bien ! 🚀
