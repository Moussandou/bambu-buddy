import { useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

/**
 * Hook pour animer un nombre qui compte progressivement
 * @param end - Valeur finale
 * @param duration - Durée de l'animation en ms (défaut: 2000)
 * @param start - Valeur de départ (défaut: 0)
 */
export function useCountUp(end: number, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const range = end - start;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + range * easeOut;

      setCount(Math.floor(current));

      if (progress === 1) {
        clearInterval(timer);
        setCount(end);
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [end, duration, start, isInView]);

  return { count, ref };
}

/**
 * Hook pour animer un pourcentage
 */
export function usePercentageCountUp(end: number, duration = 2000) {
  const { count, ref } = useCountUp(end, duration);
  return { value: `${count}%`, ref };
}

/**
 * Hook pour animer une devise
 */
export function useCurrencyCountUp(end: number, currency: string, duration = 2000) {
  const { count, ref } = useCountUp(end, duration);

  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(count);

  return { value: formatted, ref };
}
