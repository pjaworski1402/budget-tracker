'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  targetAmount?: number | null;
}

interface RecentAccountsProps {
  accounts: Account[];
  formatCurrency: (amount: number) => string;
}

export default function RecentAccounts({ accounts, formatCurrency }: RecentAccountsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Ostatnie konta</h2>
        <Link
          href="/dashboard/savings"
          className="text-purple-300 hover:text-white transition-colors text-sm font-medium"
        >
          Zarządzaj →
        </Link>
      </div>
      {accounts.length > 0 ? (
        <div className="space-y-4">
          {accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">{account.name}</h3>
                <p className="text-lg font-bold text-white">{formatCurrency(account.balance)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-purple-200/70 text-sm capitalize">
                  {account.type === 'current' ? 'Bieżące' : account.type === 'interest' ? 'Oprocentowane' : account.type === 'bond' ? 'Obligacja' : 'Cel'}
                </p>
                {account.targetAmount && (
                  <p className="text-purple-200/70 text-sm">
                    Cel: {formatCurrency(account.targetAmount)}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-purple-200/70 text-center py-8">Brak kont oszczędnościowych</p>
      )}
    </motion.div>
  );
}

