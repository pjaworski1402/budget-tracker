'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Plan {
  id: string;
  category: string;
  monthlyAmount: number;
}

interface RecentPlansProps {
  plans: Plan[];
  formatCurrency: (amount: number) => string;
}

export default function RecentPlans({ plans, formatCurrency }: RecentPlansProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Ostatnie plany</h2>
        <Link
          href="/dashboard/plans"
          className="text-purple-300 hover:text-white transition-colors text-sm font-medium"
        >
          Zarządzaj →
        </Link>
      </div>
      {plans.length > 0 ? (
        <div className="space-y-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">{plan.category}</h3>
                  <p className="text-purple-200/70 text-sm">Miesięczny budżet</p>
                </div>
                <p className="text-lg font-bold text-white">{formatCurrency(plan.monthlyAmount)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-purple-200/70 text-center py-8">Brak planów budżetowych</p>
      )}
    </motion.div>
  );
}

