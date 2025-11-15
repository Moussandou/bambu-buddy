import type { ReactNode } from 'react';
import type { JobState } from '../../types';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  style?: React.CSSProperties;
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

export function Badge({ children, variant = 'default', className = '', style }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

// Badge spécifique pour les états de jobs
interface JobStateBadgeProps {
  state: JobState;
}

const stateConfig: Record<JobState, { variant: BadgeProps['variant']; label: string }> = {
  'en impression': { variant: 'info', label: 'En impression' },
  'fini': { variant: 'success', label: 'Terminé' },
  'en vente': { variant: 'warning', label: 'En vente' },
  'vendu': { variant: 'primary', label: 'Vendu' },
};

export function JobStateBadge({ state }: JobStateBadgeProps) {
  const config = stateConfig[state];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Badge coloré pour filaments (affiche la couleur)
interface FilamentBadgeProps {
  name: string;
  colorHex: string;
  className?: string;
}

export function FilamentBadge({ name, colorHex, className = '' }: FilamentBadgeProps) {
  // Calcule si la couleur est claire ou foncée pour ajuster le texte
  const isDark = isColorDark(colorHex);

  return (
    <Badge
      className={className}
      style={{
        backgroundColor: colorHex,
        color: isDark ? '#ffffff' : '#000000',
      }}
    >
      <span className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full border border-current`} />
        {name}
      </span>
    </Badge>
  );
}

// Helper pour déterminer si une couleur est foncée
function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // Calcul luminance selon formule standard
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}
