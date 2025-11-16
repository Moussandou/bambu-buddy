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

  // Animated values based on type
  const currencyCount = useCurrencyCountUp(type === 'currency' ? value : 0, currency, 4000);
  const numberCount = useCountUp(type === 'number' ? value : 0, 4000);
  const percentageCount = useCountUp(type === 'percentage' ? value : 0, 4000);
  const hoursCount = useCountUp(type === 'hours' ? value : 0, 4000);

  const getDisplayValue = () => {
    switch (type) {
      case 'currency':
        return currencyCount.value;
      case 'percentage':
        return `${percentageCount.count}%`;
      case 'hours':
        return `${hoursCount.count}h`;
      case 'number':
      default:
        return numberCount.count.toString();
    }
  };

  const getRef = () => {
    switch (type) {
      case 'currency':
        return currencyCount.ref;
      case 'percentage':
        return percentageCount.ref;
      case 'hours':
        return hoursCount.ref;
      case 'number':
      default:
        return numberCount.ref;
    }
  };

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
      <div ref={getRef()}>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {getDisplayValue()}
        </p>
      </div>
    </motion.div>
  );
}
