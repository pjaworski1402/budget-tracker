'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardSummary {
  totalBudget: number;
  totalSavings: number;
  totalTargetSavings: number;
  budgetPlansCount: number;
  savingsAccountsCount: number;
  budgetAlertsCount: number;
  recentPlans: Array<{
    id: string;
    category: string;
    monthlyAmount: number;
  }>;
  recentAccounts: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
    targetAmount?: number | null;
  }>;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  currency: string;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const [summaryRes, userRes] = await Promise.all([
          fetch('/api/dashboard/summary', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (summaryRes.status === 401 || userRes.status === 401) {
          localStorage.removeItem('token');
          router.push('/auth/login');
          return;
        }

        const summaryData = await summaryRes.json();
        const userData = await userRes.json();

        if (summaryData.success && userData.success) {
          setSummary(summaryData.data);
          setUser(userData.data.user);
        } else {
          setError('Nie udało się załadować danych');
        }
      } catch (err) {
        setError('Wystąpił błąd podczas ładowania danych');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    localStorage.removeItem('token');
    router.push('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: user?.currency || 'PLN',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl"
        >
          Ładowanie...
        </motion.div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl text-center"
        >
          <p className="text-red-200 mb-4">{error || 'Nie udało się załadować danych'}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold"
          >
            Zaloguj się ponownie
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-purple-200">
                Witaj, {user?.name || user?.email || 'Użytkowniku'}!
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 text-white font-semibold hover:bg-white/20 transition-all"
            >
              Wyloguj się
            </motion.button>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-purple-200 text-sm font-medium">Całkowity budżet</h3>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalBudget)}</p>
              <p className="text-sm text-purple-200/70 mt-2">{summary.budgetPlansCount} planów</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-purple-200 text-sm font-medium">Oszczędności</h3>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalSavings)}</p>
              <p className="text-sm text-purple-200/70 mt-2">{summary.savingsAccountsCount} kont</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-purple-200 text-sm font-medium">Cele oszczędnościowe</h3>
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 backdrop-blur-sm border border-pink-400/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 001.946.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalTargetSavings)}</p>
              <p className="text-sm text-purple-200/70 mt-2">Łączny cel</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-purple-200 text-sm font-medium">Alerty budżetowe</h3>
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{summary.budgetAlertsCount}</p>
              <p className="text-sm text-purple-200/70 mt-2">Aktywne alerty</p>
            </motion.div>
          </div>

          {/* Recent Plans and Accounts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Plans */}
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
              {summary.recentPlans.length > 0 ? (
                <div className="space-y-4">
                  {summary.recentPlans.map((plan, index) => (
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

            {/* Recent Accounts */}
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
              {summary.recentAccounts.length > 0 ? (
                <div className="space-y-4">
                  {summary.recentAccounts.map((account, index) => (
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
                          {account.type === 'current' ? 'Bieżące' : account.type === 'interest' ? 'Oprocentowane' : 'Cel'}
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
          </div>
        </div>
      </div>
    </div>
  );
}

