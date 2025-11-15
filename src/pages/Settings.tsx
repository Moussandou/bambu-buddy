import { Settings as SettingsIcon } from 'lucide-react';
import { ProfileSection } from '../components/settings/ProfileSection';
import { CurrencySelector } from '../components/settings/CurrencySelector';
import { ThemeToggle } from '../components/settings/ThemeToggle';
import { DataManagement } from '../components/settings/DataManagement';

export function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8" />
          Paramètres
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configurez votre profil, vos préférences et gérez vos données
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <ProfileSection />
          <ThemeToggle />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <CurrencySelector />
          <DataManagement />
        </div>
      </div>
    </div>
  );
}
