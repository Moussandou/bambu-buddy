import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useCountUp, useCurrencyCountUp } from '../../hooks/useCountUp';

interface AnimatedKPICardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  type: 'currency' | 'number' | 'percentage' | 'hours';
  currency?: string;
  gradient: string;
  trend?: string;
  delay?: number;
}

export function AnimatedKPICard({
  icon: Icon,
  label,
  value,
  type,
  currency = 'EUR',
  gradient,
  trend,
  delay = 0,
}: AnimatedKPICardProps) {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay,
      },
    },
  };

  // Convertir le delay en millisecondes (delay est en secondes)
  const delayMs = delay * 1000;

  // Appeler tous les hooks inconditionnellement (règles de React)
  // mais n'utiliser que celui correspondant au type
  const { count: numberCount, ref: numberRef } = useCountUp(value, 4000, 0, delayMs);
  const { value: currencyValue, ref: currencyRef } = useCurrencyCountUp(value, currency, 4000, delayMs);

  // Sélectionner la valeur et ref appropriés selon le type
  let displayValue: string;
  let displayRef: React.RefObject<HTMLDivElement | null>;

  switch (type) {
    case 'currency':
      displayValue = currencyValue;
      displayRef = currencyRef;
      break;
    case 'percentage':
      displayValue = `${numberCount}%`;
      displayRef = numberRef;
      break;
    case 'hours':
      displayValue = `${numberCount}h`;
      displayRef = numberRef;
      break;
    case 'number':
    default:
      displayValue = numberCount.toString();
      displayRef = numberRef;
      break;
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <div ref={displayRef}>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {displayValue}
        </p>
      </div>
    </motion.div>
  );
}
