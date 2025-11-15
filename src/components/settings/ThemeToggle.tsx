import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  function toggleDarkMode() {
    setDarkMode(!darkMode);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        Apparence
      </h2>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">Mode sombre</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Activer le thème sombre pour réduire la fatigue oculaire
          </p>
        </div>

        <button
          onClick={toggleDarkMode}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            darkMode ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={darkMode}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              darkMode ? 'translate-x-7' : 'translate-x-1'
            }`}
          >
            {darkMode ? (
              <Moon className="w-4 h-4 text-blue-600 m-1" />
            ) : (
              <Sun className="w-4 h-4 text-gray-400 m-1" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
