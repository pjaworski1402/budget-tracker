'use client';

import { motion } from 'framer-motion';

interface PaymentFormData {
  category: string;
  amount: string;
  paymentDate: string;
  type: 'recurring' | 'one-time' | 'custom';
  budgetPlanId: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  dayOfWeek: number;
  dayOfMonth: number;
  month: number;
  customDates: string[];
  isPaid: boolean;
}

interface BudgetPlan {
  id: string;
  category: string;
}

interface PaymentFormProps {
  formData: PaymentFormData;
  setFormData: (data: PaymentFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
  error: string;
  editingPayment: { id: string } | null;
  budgetPlans: BudgetPlan[];
  onAddCustomDate: () => void;
  onUpdateCustomDate: (index: number, date: string) => void;
  onRemoveCustomDate: (index: number) => void;
}

export default function PaymentForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitting,
  error,
  editingPayment,
  budgetPlans,
  onAddCustomDate,
  onUpdateCustomDate,
  onRemoveCustomDate,
}: PaymentFormProps) {
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
        className="w-full max-w-2xl rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          {editingPayment ? 'Edytuj płatność' : 'Nowa płatność'}
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
              placeholder="np. Czynsz, Studia, Kredyt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Powiąż z planem budżetowym (opcjonalne)
            </label>
            <select
              value={formData.budgetPlanId}
              onChange={(e) => setFormData({ ...formData, budgetPlanId: e.target.value })}
              className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">Brak</option>
              {budgetPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Kwota
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Typ płatności
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="one-time">Jednorazowa</option>
              <option value="recurring">Cykliczna</option>
              <option value="custom">Nieregularna (własne daty)</option>
            </select>
          </div>

          {formData.type === 'one-time' && (
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Data płatności
              </label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                required
                className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          {formData.type === 'recurring' && (
            <>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Data pierwszej płatności
                </label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  required
                  className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Częstotliwość
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="weekly">Tygodniowo</option>
                  <option value="monthly">Miesięcznie</option>
                  <option value="yearly">Rocznie</option>
                </select>
              </div>
              {formData.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Dzień tygodnia (0 = niedziela, 1 = poniedziałek, ..., 6 = sobota)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
              {(formData.frequency === 'monthly' || formData.frequency === 'yearly') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Dzień miesiąca (1-31)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.dayOfMonth}
                      onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                      className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {formData.frequency === 'yearly' && (
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        Miesiąc (0 = styczeń, 11 = grudzień)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                        className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {formData.type === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Daty płatności (każda z własną kwotą)
              </label>
              <div className="space-y-3">
                {formData.customDates.map((date, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => onUpdateCustomDate(index, e.target.value)}
                      className="flex-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onRemoveCustomDate(index)}
                      className="w-12 h-12 rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-400/30 flex items-center justify-center hover:bg-red-500/30 transition-all"
                    >
                      <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                ))}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onAddCustomDate}
                  className="w-full rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-3 text-white font-semibold hover:bg-white/20 transition-all"
                >
                  + Dodaj datę
                </motion.button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPaid"
              checked={formData.isPaid}
              onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
              className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="isPaid" className="text-sm font-medium text-purple-200">
              Oznacz jako opłacone
            </label>
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
              {submitting ? 'Zapisywanie...' : editingPayment ? 'Zapisz' : 'Dodaj'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

