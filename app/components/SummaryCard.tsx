'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  delay?: number;
  iconColor?: 'purple' | 'blue' | 'pink' | 'yellow';
}

const iconColors = {
  purple: 'bg-purple-500/20 border-purple-400/30 text-purple-300',
  blue: 'bg-blue-500/20 border-blue-400/30 text-blue-300',
  pink: 'bg-pink-500/20 border-pink-400/30 text-pink-300',
  yellow: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300',
};

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  delay = 0,
  iconColor = 'purple',
}: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-purple-200 text-sm font-medium">{title}</h3>
        <div className={`w-12 h-12 rounded-xl backdrop-blur-sm border flex items-center justify-center ${iconColors[iconColor]}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-sm text-purple-200/70 mt-2">{subtitle}</p>}
    </motion.div>
  );
}

