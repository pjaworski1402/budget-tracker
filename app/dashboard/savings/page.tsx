'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SavingsAccount {
  id: string;
  name: string;
  type: 'current' | 'interest' | 'goal';
  balance: number;
  interestRate: number | null;
  targetAmount: number | null;
  createdAt: string;
  updatedAt: string;
}

interface User {
  currency: string;
}

export default function SavingsPage() {
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SavingsAccount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'current' as 'current' | 'interest' | 'goal',
    balance: '',
    interestRate: '',
    targetAmount: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const [accountsRes, userRes] = await Promise.all([
        fetch('/api/savings', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (accountsRes.status === 401 || userRes.status === 401) {
        localStorage.removeItem('token');
        router.push('/auth/login');
        return;
      }

      const accountsData = await accountsRes.json();
      const userData = await userRes.json();

      if (accountsData.success && userData.success) {
        setAccounts(accountsData.data.accounts);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const balance = parseFloat(formData.balance) || 0;
      if (balance < 0) {
        setError('Saldo nie może być ujemne');
        setSubmitting(false);
        return;
      }

      const payload: any = {
        name: formData.name,
        type: formData.type,
        balance,
      };

      if (formData.type === 'interest' && formData.interestRate) {
        const rate = parseFloat(formData.interestRate);
        if (rate < 0 || rate > 100) {
          setError('Oprocentowanie musi być między 0 a 100%');
          setSubmitting(false);
          return;
        }
        payload.interestRate = rate;
      }

      if (formData.type === 'goal' && formData.targetAmount) {
        const target = parseFloat(formData.targetAmount);
        if (target <= 0) {
          setError('Kwota celu musi być większa od zera');
          setSubmitting(false);
          return;
        }
        payload.targetAmount = target;
      }

      const url = editingAccount ? `/api/savings/${editingAccount.id}` : '/api/savings';
      const method = editingAccount ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Wystąpił błąd');
        setSubmitting(false);
        return;
      }

      setShowForm(false);
      setEditingAccount(null);
      setFormData({ name: '', type: 'current', balance: '', interestRate: '', targetAmount: '' });
      await fetchData();
    } catch (err) {
      setError('Wystąpił błąd podczas zapisywania');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (account: SavingsAccount) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      interestRate: account.interestRate?.toString() || '',
      targetAmount: account.targetAmount?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to konto?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/savings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchData();
      } else {
        setError('Nie udało się usunąć konta');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas usuwania');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: user?.currency || 'PLN',
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'current':
        return 'Bieżące';
      case 'interest':
        return 'Oprocentowane';
      case 'goal':
        return 'Cel oszczędnościowy';
      default:
        return type;
    }
  };

  const totalSavings = accounts.reduce((sum, account) => sum + account.balance, 0);
  const totalTargets = accounts
    .filter((a) => a.targetAmount)
    .reduce((sum, account) => sum + (account.targetAmount || 0), 0);

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white text-xl">
          Ładowanie...
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
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Powrót do dashboard
              </Link>
              <h1 className="text-4xl font-bold text-white mb-2">Konta oszczędnościowe</h1>
              <p className="text-purple-200">Zarządzaj swoimi oszczędnościami</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingAccount(null);
                setFormData({ name: '', type: 'current', balance: '', interestRate: '', targetAmount: '' });
                setShowForm(true);
              }}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              + Dodaj konto
            </motion.button>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-purple-200 text-sm font-medium mb-1">Całkowite oszczędności</h3>
                  <p className="text-3xl font-bold text-white">{formatCurrency(totalSavings)}</p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-purple-200 text-sm font-medium mb-1">Cele oszczędnościowe</h3>
                  <p className="text-3xl font-bold text-white">{formatCurrency(totalTargets)}</p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-pink-500/20 backdrop-blur-sm border border-pink-400/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 001.946.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowForm(false);
                setEditingAccount(null);
                setFormData({ name: '', type: 'current', balance: '', interestRate: '', targetAmount: '' });
              }}
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
                <form onSubmit={handleSubmit} className="space-y-6">
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
                  {formData.type === 'interest' && (
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
                      onClick={() => {
                        setShowForm(false);
                        setEditingAccount(null);
                        setFormData({ name: '', type: 'current', balance: '', interestRate: '', targetAmount: '' });
                      }}
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
          )}

          {/* Accounts List */}
          {accounts.length > 0 ? (
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
                          <p className="text-purple-200/70 text-sm">Oprocentowanie: {account.interestRate}%</p>
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
                          onClick={() => handleEdit(account)}
                          className="w-10 h-10 rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 flex items-center justify-center hover:bg-blue-500/30 transition-all"
                        >
                          <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(account.id)}
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
          ) : (
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
                onClick={() => {
                  setEditingAccount(null);
                  setFormData({ name: '', type: 'current', balance: '', interestRate: '', targetAmount: '' });
                  setShowForm(true);
                }}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                + Dodaj pierwsze konto
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

