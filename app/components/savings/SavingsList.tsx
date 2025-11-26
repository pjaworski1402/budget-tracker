'use client';

import { motion } from 'framer-motion';

interface SavingsAccount {
  id: string;
  name: string;
  type: 'current' | 'interest' | 'goal' | 'bond';
  balance: number;
  interestRate: number | null;
  interestFrequency: string | null;
  targetAmount: number | null;
  maturityDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SavingsListProps {
  accounts: SavingsAccount[];
  formatCurrency: (amount: number) => string;
  onEdit: (account: SavingsAccount) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'current':
      return 'Bieżące';
    case 'interest':
      return 'Oprocentowane';
    case 'goal':
      return 'Cel oszczędnościowy';
    case 'bond':
      return 'Obligacja';
    default:
      return type;
  }
};

export default function SavingsList({
  accounts,
  formatCurrency,
  onEdit,
  onDelete,
  onAddNew,
}: SavingsListProps) {
  if (accounts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-12 shadow-2xl text-center"
      >
        <div className="w-16 h-16 rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Brak kont oszczędnościowych</h3>
        <p className="text-purple-200/70 mb-6">Dodaj pierwsze konto, aby rozpocząć śledzenie oszczędności</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddNew}
          className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          + Dodaj pierwsze konto
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {accounts.map((account, index) => {
        const progress = account.targetAmount
          ? Math.min((account.balance / account.targetAmount) * 100, 100)
          : null;
        return (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{account.name}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    {getTypeLabel(account.type)}
                  </span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{formatCurrency(account.balance)}</p>
                {account.interestRate && (
                  <p className="text-purple-200/70 text-sm">
                    Oprocentowanie: {account.interestRate}%
                    {account.interestFrequency && (
                      <span className="ml-2">
                        ({account.interestFrequency === 'daily' ? 'codziennie' : account.interestFrequency === 'monthly' ? 'miesięcznie' : 'rocznie'})
                      </span>
                    )}
                  </p>
                )}
                {account.maturityDate && (
                  <p className="text-purple-200/70 text-sm">
                    Termin zapadalności: {new Date(account.maturityDate).toLocaleDateString('pl-PL')}
                  </p>
                )}
                {account.targetAmount && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-purple-200/70">Cel: {formatCurrency(account.targetAmount)}</span>
                      <span className="text-purple-200/70">{Math.round(progress || 0)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEdit(account)}
                  className="w-10 h-10 rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 flex items-center justify-center hover:bg-blue-500/30 transition-all"
                >
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDelete(account.id)}
                  className="w-10 h-10 rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-400/30 flex items-center justify-center hover:bg-red-500/30 transition-all"
                >
                  <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

