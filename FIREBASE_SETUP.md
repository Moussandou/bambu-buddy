# Configuration Firebase - Guide Complet

Ce guide te montre **étape par étape** comment configurer Firebase pour Bambu Buddy.

## 1. Créer un Projet Firebase

1. Va sur [console.firebase.google.com](https://console.firebase.google.com)
2. Clique sur **"Ajouter un projet"**
3. Nom du projet : `bambu-buddy` (ou ton choix)
4. Désactive Google Analytics si tu n'en as pas besoin (optionnel)
5. Clique **"Créer le projet"**

## 2. Activer Authentication

1. Dans la sidebar, clique sur **"Authentication"**
2. Clique **"Get started"**
3. Onglet **"Sign-in method"**
4. Active les méthodes :
   - **Email/Password** : Clique, active, enregistre
   - **Google** : Clique, active, enregistre

## 3. Créer la Base de Données Firestore

1. Dans la sidebar, clique sur **"Firestore Database"**
2. Clique **"Créer une base de données"**
3. Mode : **Production** (on va ajouter les règles manuellement)
4. Emplacement : Choisis **europe-west** (ou ton choix)
5. Clique **"Activer"**

### 3.1 Ajouter les Règles de Sécurité

1. Va dans l'onglet **"Règles"** (Rules)
2. **Supprime tout** le contenu actuel
3. **Copie-colle** le contenu du fichier `firestore.rules` de ce projet
4. Clique **"Publier"** (Publish)

Les règles assurent que :
- Chaque utilisateur ne peut voir/modifier que ses propres données
- Les données sont validées (types, champs obligatoires)
- Les transactions d'inventaire sont immuables

## 4. Activer Storage (pour les images)

1. Dans la sidebar, clique sur **"Storage"**
2. Clique **"Get started"**
3. Mode : **Production**
4. Emplacement : Même que Firestore
5. Clique **"Terminer"**

### 4.1 Ajouter les Règles Storage

1. Va dans l'onglet **"Règles"** (Rules)
2. **Supprime tout** le contenu actuel
3. **Copie-colle** le contenu du fichier `storage.rules` de ce projet
4. Clique **"Publier"**

Les règles assurent que :
- Seul le propriétaire peut uploader/supprimer ses images
- Images limitées à 5MB
- Seuls les formats images sont acceptés

## 5. Récupérer la Configuration

1. Va dans **"Project Settings"** (icône ⚙️ en haut à gauche)
2. Scroll vers le bas jusqu'à **"Your apps"**
3. Clique sur l'icône **Web** `</>`
4. Nom de l'app : `Bambu Buddy Web`
5. **NE PAS** cocher Firebase Hosting pour l'instant
6. Clique **"Enregistrer l'application"**
7. Copie la configuration qui s'affiche (objet `firebaseConfig`)

Exemple :
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "bambu-buddy.firebaseapp.com",
  projectId: "bambu-buddy",
  storageBucket: "bambu-buddy.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## 6. Configurer les Variables d'Environnement

1. **Copie** `.env.example` en `.env.local` :
   ```bash
   cp .env.example .env.local
   ```

2. **Édite** `.env.local` et remplis les valeurs depuis ta config Firebase :

   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=bambu-buddy.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=bambu-buddy
   VITE_FIREBASE_STORAGE_BUCKET=bambu-buddy.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
   ```

3. **Sauvegarde** le fichier

⚠️ **IMPORTANT** : Ne commit **JAMAIS** `.env.local` dans git (déjà dans `.gitignore`)

## 7. Vérification

Lance l'app :
```bash
npm run dev
```

1. Ouvre [http://localhost:5173](http://localhost:5173)
2. Tu devrais voir la page de login
3. Crée un compte (Email + Password)
4. Tu devrais être redirigé vers le Dashboard

Si ça marche, tu verras :
- ✅ Dashboard vide (normal, pas encore de données)
- ✅ Sidebar avec navigation
- ✅ Ton nom/email en bas de la sidebar

## 8. Ajouter des Données de Test (optionnel)

Pour remplir ta base avec des données d'exemple :

1. Connecte-toi à l'app
2. Ouvre la **console navigateur** (F12 > Console)
3. Tape cette commande :
   ```javascript
   // Récupère d'abord ton userId
   console.log(window.location.href) // regarde l'URL

   // Puis importe et exécute le seed
   import('./utils/seedData').then(({ seedDatabase }) => {
     const userId = 'TON_USER_ID_ICI'; // remplace par ton UID
     seedDatabase(userId);
   });
   ```

**OU** directement depuis Firebase Console :

1. Va dans Firestore Database
2. Clique **"Démarrer une collection"**
3. Nom : `filaments`
4. Ajoute manuellement quelques docs (vois `src/types/index.ts` pour structure)

## 9. Index Firestore (si erreurs de requêtes)

Si tu vois des erreurs dans la console du type :
```
The query requires an index. You can create it here: https://...
```

1. **Clique sur le lien** dans l'erreur
2. Firebase va t'ouvrir la page de création d'index
3. Clique **"Créer l'index"**
4. Attends 1-2 minutes (construction de l'index)
5. Recharge la page

Les index sont nécessaires pour les requêtes avec `orderBy` + `where`.

## 10. Sécurité : Vérifications Finales

### Firestore Rules ✓
1. Va dans Firestore > Règles
2. Vérifie que tu vois `isOwner(userId)` dans les règles
3. Test : essaie de lire des données d'un autre user (devrait échouer)

### Storage Rules ✓
1. Va dans Storage > Règles
2. Vérifie `isOwner(userId)`
3. Limite 5MB visible

### Auth ✓
1. Va dans Authentication > Settings
2. **Domains autorisés** : Ajoute ton domaine si tu déploies (ex: `bambu-buddy.web.app`)

## Troubleshooting

### Erreur "Permission denied"
- Vérifie que les règles Firestore/Storage sont bien déployées
- Vérifie que `userId` dans les documents correspond à `request.auth.uid`

### Erreur "Failed to get document because the client is offline"
- Normal si pas encore de données
- L'app fonctionne offline grâce à la persistence

### Erreur "Firebase: Error (auth/...)"
- Vérifie que Authentication est activé
- Vérifie que Email/Password est activé dans Sign-in methods

### Impossible de se connecter
- Vérifie `.env.local`
- Vérifie que les valeurs correspondent à Firebase Console
- Restart le dev server (`Ctrl+C` puis `npm run dev`)

## Ressources

- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Rules Guide](https://firebase.google.com/docs/storage/security/start)

---

Une fois tout configuré, tu es prêt à coder ! 🚀
