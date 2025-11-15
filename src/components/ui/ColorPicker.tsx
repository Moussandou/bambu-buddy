import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

// Couleurs prédéfinies communes pour filaments
const PRESET_COLORS = [
  '#ffffff', // Blanc
  '#000000', // Noir
  '#ef4444', // Rouge
  '#f59e0b', // Orange
  '#eab308', // Jaune
  '#22c55e', // Vert
  '#3b82f6', // Bleu
  '#8b5cf6', // Violet
  '#ec4899', // Rose
  '#6b7280', // Gris
  '#fb923c', // Orange clair
  '#14b8a6', // Turquoise
];

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="flex items-center gap-3">
        {/* Couleur actuelle */}
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="relative w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm hover:border-primary-500 transition-colors"
          style={{ backgroundColor: color }}
        >
          <span className="sr-only">Choisir une couleur</span>
        </button>

        {/* Input hex manuel */}
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
          maxLength={7}
        />
      </div>

      {/* Couleurs prédéfinies */}
      <div className="grid grid-cols-12 gap-2">
        {PRESET_COLORS.map((presetColor) => (
          <button
            key={presetColor}
            type="button"
            onClick={() => onChange(presetColor)}
            className={`w-full aspect-square rounded border-2 transition-all hover:scale-110 ${
              color.toLowerCase() === presetColor.toLowerCase()
                ? 'border-primary-500 ring-2 ring-primary-200'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            style={{ backgroundColor: presetColor }}
            title={presetColor}
          >
            <span className="sr-only">{presetColor}</span>
          </button>
        ))}
      </div>

      {/* Picker avancé */}
      {showPicker && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <HexColorPicker color={color} onChange={onChange} />
          <button
            type="button"
            onClick={() => setShowPicker(false)}
            className="mt-3 w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Terminé
          </button>
        </div>
      )}
    </div>
  );
}
