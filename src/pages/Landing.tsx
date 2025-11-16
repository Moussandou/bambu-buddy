import { useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, TrendingUp, Package, DollarSign, ChevronRight, Sparkles, BarChart3, Bell } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface LandingProps {
  onGetStarted: () => void;
}

export function Landing({ onGetStarted }: LandingProps) {
  const [isHovering, setIsHovering] = useState<string | null>(null);

  const features = [
    {
      icon: Package,
      title: 'Gestion d\'inventaire',
      description: 'Suivez vos filaments, matériaux et consommables en temps réel',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: TrendingUp,
      title: 'Suivi de production',
      description: 'Gérez vos impressions avec un système Kanban intuitif',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: DollarSign,
      title: 'Analyse financière',
      description: 'Calculez vos coûts et profits automatiquement',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'Statistiques avancées',
      description: 'Visualisez vos performances avec des graphiques détaillés',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Bell,
      title: 'Notifications intelligentes',
      description: 'Recevez des alertes pour vos impressions terminées',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Sparkles,
      title: 'Export de données',
      description: 'Exportez vos rapports en PDF, Excel ou CSV',
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-200/30 to-purple-200/30 dark:from-primary-900/20 dark:to-purple-900/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-200/30 to-pink-200/30 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo animé */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center mb-8"
            >
              <motion.div
                animate={{
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-2xl"
              >
                <Printer className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">
                Bambu Buddy
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Votre assistant intelligent pour gérer votre activité d'impression 3D.
              Suivi, analyse, profits... tout en un seul endroit.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                onClick={onGetStarted}
                className="group relative px-8 py-4 text-lg overflow-hidden"
              >
                <motion.span
                  className="relative z-10 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  Commencer gratuitement
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
          </motion.div>

          {/* Screenshot mockup animé */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-20 relative"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative mx-auto max-w-5xl rounded-2xl shadow-2xl overflow-hidden border-8 border-gray-800 dark:border-gray-700"
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-lg p-4 backdrop-blur-sm"
                    >
                      <div className="h-3 w-3 rounded-full bg-primary-500 mb-2" />
                      <div className="h-2 bg-white/20 rounded mb-2" />
                      <div className="h-2 w-2/3 bg-white/10 rounded" />
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 + i * 0.1 }}
                      className="h-12 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-lg backdrop-blur-sm"
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating elements */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-50 blur-xl"
            />
            <motion.div
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-50 blur-xl"
            />
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Des outils professionnels pour faire grandir votre activité
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  onHoverStart={() => setIsHovering(`feature-${index}`)}
                  onHoverEnd={() => setIsHovering(null)}
                  className="relative group"
                >
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    <motion.div
                      animate={{
                        scale: isHovering === `feature-${index}` ? 1.1 : 1,
                        rotate: isHovering === `feature-${index}` ? 5 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>

                    {/* Animated border on hover */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: isHovering === `feature-${index}` ? 1 : 0 }}
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-10`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-3xl p-12 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: '10k+', label: 'Impressions suivies' },
              { value: '500+', label: 'Utilisateurs actifs' },
              { value: '99%', label: 'Satisfaction client' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-100">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CTA Final */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Prêt à optimiser votre production ?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines de makers qui ont transformé leur activité avec Bambu Buddy
          </p>
          <Button
            onClick={onGetStarted}
            className="group px-8 py-4 text-lg"
          >
            <span className="flex items-center gap-2">
              Commencer maintenant
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
