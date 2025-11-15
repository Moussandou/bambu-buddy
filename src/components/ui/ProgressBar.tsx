interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  value,
  max = 100,
  color,
  showLabel = false,
  label,
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Couleur par défaut selon le pourcentage
  const defaultColor = getColorByPercentage(percentage);
  const barColor = color || defaultColor;

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-xs text-gray-600 dark:text-gray-400">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className="h-full transition-all duration-300 ease-out rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
}

// Helper pour couleur automatique selon pourcentage
function getColorByPercentage(percentage: number): string {
  if (percentage >= 75) return '#ef4444'; // rouge (critique)
  if (percentage >= 50) return '#f59e0b'; // orange (moyen)
  if (percentage >= 25) return '#3b82f6'; // bleu (bon)
  return '#10b981'; // vert (excellent)
}

// Variante avec label intégré pour filaments
interface FilamentProgressProps {
  weightInitial: number;
  weightRemaining: number;
  name: string;
  colorHex?: string;
}

export function FilamentProgress({
  weightInitial,
  weightRemaining,
  name,
  colorHex,
}: FilamentProgressProps) {
  const percentage = weightInitial > 0 ? ((weightInitial - weightRemaining) / weightInitial) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span>
        <span className="text-gray-500 dark:text-gray-400">
          {weightRemaining}g / {weightInitial}g
        </span>
      </div>
      <ProgressBar
        value={percentage}
        color={colorHex}
        size="md"
      />
    </div>
  );
}
