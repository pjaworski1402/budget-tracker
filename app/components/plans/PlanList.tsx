'use client';

import { motion } from 'framer-motion';

interface Plan {
  id: string;
  category: string;
  monthlyAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface PlanListProps {
  plans: Plan[];
  formatCurrency: (amount: number) => string;
  onEdit: (plan: Plan) => void;
  onDelete: (id: string) => void;
}

export default function PlanList({ plans, formatCurrency, onEdit, onDelete }: PlanListProps) {
  if (plans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-12 shadow-2xl text-center"
      >
        <div className="w-16 h-16 rounded-xl bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Brak planów budżetowych</h3>
        <p className="text-purple-200/70">Dodaj pierwszy plan, aby rozpocząć zarządzanie budżetem</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {plans.map((plan, index) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.1 }}
          className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">{plan.category}</h3>
              <p className="text-purple-200/70 text-sm">
                Utworzono: {new Date(plan.createdAt).toLocaleDateString('pl-PL')}
              </p>
            </div>
            <div className="text-right mr-6">
              <p className="text-2xl font-bold text-white">{formatCurrency(plan.monthlyAmount)}</p>
              <p className="text-purple-200/70 text-sm">miesięcznie</p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(plan)}
                className="w-10 h-10 rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 flex items-center justify-center hover:bg-blue-500/30 transition-all"
              >
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(plan.id)}
                className="w-10 h-10 rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-400/30 flex items-center justify-center hover:bg-red-500/30 transition-all"
              >
                <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

