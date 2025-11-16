#!/bin/bash

# 🔥 Script de Déploiement Firebase - Bambu Buddy
# Ce script déploie les index et règles Firestore

echo "🚀 Déploiement Firebase pour Bambu Buddy"
echo "=========================================="
echo ""

# Vérifier si Firebase CLI est installé
if ! command -v firebase &> /dev/null
then
    echo "⚠️  Firebase CLI n'est pas installé"
    echo "📦 Installation de Firebase CLI..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI trouvé"
echo ""

# Login Firebase
echo "🔐 Connexion à Firebase..."
firebase login

echo ""
echo "📋 Que voulez-vous déployer ?"
echo "1) Index Firestore uniquement (recommandé)"
echo "2) Règles Firestore + Storage"
echo "3) Tout (Index + Règles)"
echo ""

read -p "Votre choix (1-3): " choice

case $choice in
  1)
    echo ""
    echo "📊 Déploiement des index Firestore..."
    firebase deploy --only firestore:indexes
    echo ""
    echo "✅ Index déployés !"
    echo "⏱️  Attendre 2-5 minutes pour que les index soient créés"
    ;;
  2)
    echo ""
    echo "🔒 Déploiement des règles de sécurité..."
    firebase deploy --only firestore:rules,storage:rules
    echo ""
    echo "✅ Règles déployées !"
    ;;
  3)
    echo ""
    echo "🚀 Déploiement complet..."
    firebase deploy --only firestore
    echo ""
    echo "✅ Déploiement complet terminé !"
    echo "⏱️  Attendre 2-5 minutes pour que les index soient créés"
    ;;
  *)
    echo "❌ Choix invalide"
    exit 1
    ;;
esac

echo ""
echo "=========================================="
echo "✨ Déploiement terminé !"
echo ""
echo "📝 Prochaines étapes :"
echo "1. Attendre 2-5 minutes (création des index)"
echo "2. Vérifier Firebase Console > Firestore > Indexes"
echo "3. Rafraîchir l'application"
echo ""
echo "🔗 Firebase Console:"
echo "   https://console.firebase.google.com/project/bambu-buddy/firestore/indexes"
echo ""
