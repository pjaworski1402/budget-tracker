'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
  userName: string | null | undefined;
  onLogout: () => void;
}

export default function DashboardHeader({ userName, onLogout }: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-purple-200">
          Witaj, {userName || 'Użytkowniku'}!
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onLogout}
        className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 text-white font-semibold hover:bg-white/20 transition-all"
      >
        Wyloguj się
      </motion.button>
    </motion.div>
  );
}

