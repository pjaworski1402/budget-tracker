'use client';

import { motion } from 'framer-motion';

interface PlanFormData {
  category: string;
  monthlyAmount: string;
}

interface PlanFormProps {
  formData: PlanFormData;
  setFormData: (data: PlanFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
  error: string;
  editingPlan: { id: string } | null;
}

export default function PlanForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitting,
  error,
  editingPlan,
}: PlanFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          {editingPlan ? 'Edytuj plan' : 'Nowy plan budżetowy'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Kategoria
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="np. Jedzenie, Transport, Mieszkanie"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Kwota miesięczna
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.monthlyAmount}
              onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
              required
              className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>
          {error && (
            <div className="rounded-xl bg-red-500/20 border border-red-400/30 px-4 py-3 text-red-200 text-sm">
              {error}
            </div>
          )}
          <div className="flex gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="flex-1 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 text-white font-semibold hover:bg-white/20 transition-all"
            >
              Anuluj
            </motion.button>
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? 'Zapisywanie...' : editingPlan ? 'Zapisz' : 'Dodaj'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

