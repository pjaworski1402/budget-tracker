'use client';

import { motion } from 'framer-motion';

interface SavingsFormData {
  name: string;
  type: 'current' | 'interest' | 'goal' | 'bond';
  balance: string;
  interestRate: string;
  interestFrequency: 'daily' | 'monthly' | 'yearly';
  targetAmount: string;
  maturityDate: string;
}

interface BudgetPlan {
  id: string;
  category: string;
}

interface SavingsFormProps {
  formData: SavingsFormData;
  setFormData: (data: SavingsFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
  error: string;
  editingAccount: { id: string } | null;
  budgetPlans: BudgetPlan[];
}

export default function SavingsForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitting,
  error,
  editingAccount,
  budgetPlans,
}: SavingsFormProps) {
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
        className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          {editingAccount ? 'Edytuj konto' : 'Nowe konto oszczędnościowe'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Nazwa konta
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="np. Konto główne, Oszczędności na wakacje"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Typ konta
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="current">Bieżące</option>
              <option value="interest">Oprocentowane</option>
              <option value="goal">Cel oszczędnościowy</option>
              <option value="bond">Obligacja</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Saldo początkowe
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              required
              className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>
          {(formData.type === 'interest' || formData.type === 'bond') && (
            <>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Oprocentowanie (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="np. 5.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Częstotliwość wypłat odsetek
                </label>
                <select
                  value={formData.interestFrequency}
                  onChange={(e) => setFormData({ ...formData, interestFrequency: e.target.value as any })}
                  className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="daily">Codziennie</option>
                  <option value="monthly">Miesięcznie</option>
                  <option value="yearly">Rocznie</option>
                </select>
              </div>
            </>
          )}
          {formData.type === 'goal' && (
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Kwota celu
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="0.00"
              />
            </div>
          )}
          {formData.type === 'bond' && (
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Data wykupu (termin zapadalności)
              </label>
              <input
                type="date"
                value={formData.maturityDate}
                onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
                className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          )}
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
              {submitting ? 'Zapisywanie...' : editingAccount ? 'Zapisz' : 'Dodaj'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

