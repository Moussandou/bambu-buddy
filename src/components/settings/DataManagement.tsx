import { useState } from 'react';
import { Download, Upload, Database } from 'lucide-react';
import { collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db, COLLECTIONS } from '../../lib/firebase';
import { Button } from '../ui/Button';

export function DataManagement() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleExportData() {
    if (!userData) return;

    setLoading(true);
    try {
      const exportData: {
        exportDate: string;
        user: { email: string; displayName: string; currency: string };
        data: Record<string, unknown[]>;
      } = {
        exportDate: new Date().toISOString(),
        user: {
          email: userData.email,
          displayName: userData.displayName,
          currency: userData.currency,
        },
        data: {},
      };

      // Export all collections
      const collections = [
        COLLECTIONS.FILAMENTS,
        COLLECTIONS.JOBS,
        COLLECTIONS.SALES,
        COLLECTIONS.TRANSACTIONS,
        COLLECTIONS.TEMPLATES,
      ];

      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName),
          where('userId', '==', userData.uid)
        );
        const snapshot = await getDocs(q);
        exportData.data[collectionName] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bambu-buddy-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Données exportées avec succès');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Erreur lors de l\'export des données');
    } finally {
      setLoading(false);
    }
  }

  async function handleImportData() {
    if (!userData) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setLoading(true);
      try {
        const text = await file.text();
        const importData = JSON.parse(text);

        if (!importData.data) {
          throw new Error('Format de fichier invalide');
        }

        if (!confirm('Cette opération va remplacer toutes vos données actuelles. Continuer ?')) {
          setLoading(false);
          return;
        }

        const batch = writeBatch(db);

        // Import each collection
        for (const [collectionName, items] of Object.entries(importData.data)) {
          if (!Array.isArray(items)) continue;

          for (const item of items as Record<string, unknown>[]) {
            // Remove id from item before importing
            const { id, ...data } = item;
            // Update userId to current user
            data.userId = userData.uid;
            void id; // Mark as intentionally unused
            const docRef = doc(collection(db, collectionName));
            batch.set(docRef, data);
          }
        }

        await batch.commit();
        alert('Données importées avec succès. Rechargez la page pour voir les changements.');
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Erreur lors de l\'import des données');
      } finally {
        setLoading(false);
      }
    };

    input.click();
  }

  async function handleDownloadBackup() {
    await handleExportData();
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Database className="w-5 h-5" />
        Gestion des données
      </h2>

      <div className="space-y-4">
        <div className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              Exporter toutes les données
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Télécharger toutes vos données au format JSON
            </p>
          </div>
          <Button
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportData}
            isLoading={loading}
            variant="secondary"
          >
            Exporter
          </Button>
        </div>

        <div className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              Importer des données
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Restaurer vos données depuis un fichier JSON
            </p>
          </div>
          <Button
            icon={<Upload className="w-4 h-4" />}
            onClick={handleImportData}
            isLoading={loading}
            variant="secondary"
          >
            Importer
          </Button>
        </div>

        <div className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              Sauvegarde manuelle
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Créer une sauvegarde complète de vos données
            </p>
          </div>
          <Button
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownloadBackup}
            isLoading={loading}
          >
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Important :</strong> L'import de données remplacera toutes vos données actuelles.
          Assurez-vous de créer une sauvegarde avant d'importer.
        </p>
      </div>
    </div>
  );
}
