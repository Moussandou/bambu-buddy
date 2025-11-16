# 🔧 Résolution des Problèmes Courants

## ❌ Erreur : "The query requires an index"

**Symptôme** : Dans la console navigateur :
```
Error fetching jobs: FirebaseError: The query requires an index
```

**Cause** : Firebase nécessite des index composites pour les requêtes complexes.

**Solution Rapide** :
1. Cliquer sur le lien dans le message d'erreur de la console
2. Cliquer sur "Create Index" dans Firebase Console
3. Attendre 2-5 minutes

**Solution Automatique** :
```bash
firebase deploy --only firestore:indexes
```

Voir `FIREBASE_INDEXES_SETUP.md` pour plus de détails.

---

## ❌ Erreur Service Worker : "Request scheme 'chrome-extension' is unsupported"

**Symptôme** :
```
Failed to execute 'put' on 'Cache': Request scheme 'chrome-extension' is unsupported
Failed to execute 'put' on 'Cache': Request method 'POST' is unsupported
```

**Cause** : Le Service Worker essaie de cacher des requêtes non-GET ou des URLs d'extensions.

**Solution** : ✅ **DÉJÀ CORRIGÉ** dans `public/sw.js`

Le SW filtre maintenant :
- Requêtes non-GET (POST, PUT, DELETE)
- URLs chrome-extension://
- APIs Firebase (firestore.googleapis.com)

---

## ⚠️ Avertissement : "enableIndexedDbPersistence() will be deprecated"

**Symptôme** :
```
@firebase/firestore: enableIndexedDbPersistence() will be deprecated in the future
```

**Cause** : Ancienne API de persistence Firebase.

**Solution** : ✅ **DÉJÀ CORRIGÉ** dans `src/lib/firebase.ts`

Nouvelle implémentation :
```typescript
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
```

---

## ❌ Erreur : Données ne se chargent pas

**Vérifications** :

1. **Firebase est configuré** ?
   - Vérifier `.env.local` existe et contient les bonnes clés
   - Vérifier console Firebase que Auth/Firestore/Storage sont activés

2. **Index créés** ?
   - Aller dans Firebase Console > Firestore Database > Indexes
   - Vérifier que les index ont le statut "Enabled" ✅ (pas "Building" 🔨)

3. **Règles de sécurité** ?
   - Aller dans Firebase Console > Firestore Database > Rules
   - Vérifier que le contenu de `firestore.rules` est déployé

4. **Utilisateur connecté** ?
   - Vérifier que vous êtes bien connecté (voir email dans la sidebar)

---

## ❌ Erreur : Upload d'images échoue

**Vérifications** :

1. **Storage activé** ?
   - Firebase Console > Storage > Get Started

2. **Règles Storage déployées** ?
   - Firebase Console > Storage > Rules
   - Copier le contenu de `storage.rules`

3. **Taille fichier** ?
   - Maximum 5 MB par image
   - Formats supportés : JPG, PNG, GIF, WebP

---

## ❌ Erreur de build / TypeScript

**Nettoyage complet** :
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🐛 Debug Mode

Activer les logs détaillés :

Dans `src/hooks/useFirestore.ts`, les logs sont déjà activés :
```typescript
console.log('[useUserCollection] Setting up listener for:', collectionName);
```

Pour désactiver, commenter ces lignes.

---

## 📞 Besoin d'aide ?

1. Vérifier la console navigateur (F12)
2. Vérifier la console Firebase
3. Lire les messages d'erreur complets
4. Consulter la documentation Firebase : https://firebase.google.com/docs

---

## ✅ Checklist Installation

- [ ] `npm install` exécuté
- [ ] `.env.local` créé et rempli
- [ ] Firebase Auth activé (Email + Google)
- [ ] Firestore Database créé
- [ ] Storage activé
- [ ] Règles Firestore déployées
- [ ] Règles Storage déployées
- [ ] **Index Firestore créés** ⚠️ (le plus souvent oublié)
- [ ] App démarre avec `npm run dev`
- [ ] Login fonctionne
- [ ] Dashboard affiche les données

Si tous les points sont cochés et ça ne fonctionne pas, vérifier les erreurs dans la console navigateur.
