'use client';

import { motion } from 'framer-motion';

interface Payment {
  id: string;
  category: string;
  amount: number;
  paymentDate: string;
  type: 'recurring' | 'one-time' | 'custom';
  frequency?: 'weekly' | 'monthly' | 'yearly' | null;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  isPaid: boolean;
  budgetPlan?: {
    category: string;
  } | null;
}

interface PaymentListProps {
  payments: Payment[];
  formatCurrency: (amount: number) => string;
  onEdit: (payment: Payment) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'recurring':
      return 'Cykliczna';
    case 'one-time':
      return 'Jednorazowa';
    case 'custom':
      return 'Nieregularna';
    default:
      return type;
  }
};

export default function PaymentList({
  payments,
  formatCurrency,
  onEdit,
  onDelete,
  onAddNew,
}: PaymentListProps) {
  if (payments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-12 shadow-2xl text-center"
      >
        <div className="w-16 h-16 rounded-xl bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Brak płatności</h3>
        <p className="text-purple-200/70 mb-6">Dodaj pierwszą płatność, aby rozpocząć śledzenie terminów</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddNew}
          className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          + Dodaj pierwszą płatność
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment, index) => (
        <motion.div
          key={payment.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.05 }}
          className={`rounded-3xl backdrop-blur-xl border p-6 shadow-2xl ${
            payment.isPaid
              ? 'bg-green-500/10 border-green-400/20'
              : new Date(payment.paymentDate) < new Date()
              ? 'bg-red-500/10 border-red-400/20'
              : 'bg-white/10 border-white/20'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">{payment.category}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {getTypeLabel(payment.type)}
                </span>
                {payment.isPaid && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                    Opłacone
                  </span>
                )}
                {!payment.isPaid && new Date(payment.paymentDate) < new Date() && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-400/30">
                    Przeterminowane
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-white mb-1">{formatCurrency(payment.amount)}</p>
              <p className="text-purple-200/70 text-sm">
                Data: {new Date(payment.paymentDate).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              {payment.frequency && (
                <p className="text-purple-200/70 text-sm">
                  {payment.frequency === 'weekly'
                    ? 'Tygodniowo'
                    : payment.frequency === 'monthly'
                    ? 'Miesięcznie'
                    : 'Rocznie'}
                  {payment.dayOfWeek !== null && `, dzień: ${payment.dayOfWeek}`}
                  {payment.dayOfMonth !== null && `, dzień miesiąca: ${payment.dayOfMonth}`}
                </p>
              )}
              {payment.budgetPlan && (
                <p className="text-purple-200/70 text-sm">
                  Plan: {payment.budgetPlan.category}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(payment)}
                className="w-10 h-10 rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 flex items-center justify-center hover:bg-blue-500/30 transition-all"
              >
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(payment.id)}
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

