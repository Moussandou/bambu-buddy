# Quick Start - Bambu Buddy

## Setup rapide (5 min)

### 1. Firebase Config

```bash
# 1. Copie le fichier d'environnement
cp .env.example .env.local

# 2. Édite .env.local avec ta config Firebase
# (récupère-la depuis Firebase Console > Project Settings)
```

### 2. Lance l'app

```bash
# Dev server
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173)

### 3. Première connexion

1. Clique "Pas de compte ? Créer un compte"
2. Entre tes infos (nom, email, mot de passe)
3. Tu arrives sur le Dashboard vide (normal !)

### 4. Ajoute des données de test (optionnel)

**Option A - Console navigateur** (recommandé)

1. Ouvre la console (F12 > Console)
2. Récupère ton `userId` :
   ```javascript
   // Dans la console Firebase (onglet Authentication)
   // Ou directement :
   const user = auth.currentUser;
   console.log(user.uid); // copie ce UID
   ```

3. Importe et exécute le seed :
   ```javascript
   import('./src/utils/seedData.js').then(({ seedDatabase }) => {
     seedDatabase('TON_USER_ID_ICI'); // remplace par ton UID
   });
   ```

**Option B - Firebase Console**

1. Va dans Firebase Console > Firestore Database
2. Ajoute manuellement des documents dans les collections
3. Vois `src/types/index.ts` pour la structure

### 5. C'est parti !

Tu devrais maintenant voir :
- ✅ KPIs sur le Dashboard
- ✅ Filaments dans les alertes stock
- ✅ Impressions récentes
- ✅ Navigation fonctionnelle

---

## Structure du Projet

```
src/
├── components/
│   ├── layout/          # Sidebar, Layout
│   └── ui/              # Card, Button, Badge, etc.
├── contexts/            # AuthContext
├── hooks/               # useFirestore
├── lib/                 # firebase.ts
├── pages/               # Dashboard, Login, etc.
├── services/            # filaments.ts, jobs.ts (Firebase CRUD)
├── types/               # Types TypeScript
├── utils/               # calculations.ts, seedData.ts
├── App.tsx              # Router
└── main.tsx
```

---

## Commandes Utiles

```bash
npm run dev          # Dev server (localhost:5173)
npm run build        # Build production
npm run preview      # Preview build localement
npm run lint         # ESLint
```

---

## Prochaines Étapes

Vois `NEXT_STEPS.md` pour la roadmap complète.

Priorités :
1. **Page Filaments** (CRUD + gestion stock)
2. **Page Jobs** (Kanban drag & drop)
3. **Page Ventes** (historique + export)
4. **Page Wallet** (graphiques)

---

## Problèmes Fréquents

### "Permission denied" dans Firestore
→ Vérifie que les règles sont bien déployées (vois `FIREBASE_SETUP.md`)

### "Cannot find module X"
→ `npm install` puis restart le dev server

### Le Dashboard est vide
→ Normal si tu n'as pas ajouté de données (utilise le seed)

### Erreurs de build
→ `npm run build` pour vérifier

---

## Resources

- [README.md](./README.md) - Doc complète
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Setup Firebase pas à pas
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Roadmap et features à implémenter

Bon dev ! 🚀
