'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BudgetPlan {
  id: string;
  category: string;
  monthlyAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  currency: string;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<BudgetPlan[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BudgetPlan | null>(null);
  const [formData, setFormData] = useState({ category: '', monthlyAmount: '' });
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
      const [plansRes, userRes] = await Promise.all([
        fetch('/api/plans', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (plansRes.status === 401 || userRes.status === 401) {
        localStorage.removeItem('token');
        router.push('/auth/login');
        return;
      }

      const plansData = await plansRes.json();
      const userData = await userRes.json();

      if (plansData.success && userData.success) {
        setPlans(plansData.data.plans);
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
      const amount = parseFloat(formData.monthlyAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Kwota musi być większa od zera');
        setSubmitting(false);
        return;
      }

      const url = editingPlan ? `/api/plans/${editingPlan.id}` : '/api/plans';
      const method = editingPlan ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: formData.category,
          monthlyAmount: amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Wystąpił błąd');
        setSubmitting(false);
        return;
      }

      setShowForm(false);
      setEditingPlan(null);
      setFormData({ category: '', monthlyAmount: '' });
      await fetchData();
    } catch (err) {
      setError('Wystąpił błąd podczas zapisywania');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (plan: BudgetPlan) => {
    setEditingPlan(plan);
    setFormData({
      category: plan.category,
      monthlyAmount: plan.monthlyAmount.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten plan?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/plans/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchData();
      } else {
        setError('Nie udało się usunąć planu');
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

  const totalBudget = plans.reduce((sum, plan) => sum + plan.monthlyAmount, 0);

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
              <h1 className="text-4xl font-bold text-white mb-2">Plany budżetowe</h1>
              <p className="text-purple-200">Zarządzaj swoimi kategoriami wydatków</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingPlan(null);
                setFormData({ category: '', monthlyAmount: '' });
                setShowForm(true);
              }}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              + Dodaj plan
            </motion.button>
          </motion.div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-purple-200 text-sm font-medium mb-1">Całkowity budżet miesięczny</h3>
                <p className="text-3xl font-bold text-white">{formatCurrency(totalBudget)}</p>
              </div>
              <div className="w-16 h-16 rounded-xl bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Form Modal */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowForm(false);
                setEditingPlan(null);
                setFormData({ category: '', monthlyAmount: '' });
              }}
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
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      onClick={() => {
                        setShowForm(false);
                        setEditingPlan(null);
                        setFormData({ category: '', monthlyAmount: '' });
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
                      {submitting ? 'Zapisywanie...' : editingPlan ? 'Zapisz' : 'Dodaj'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* Plans List */}
          {plans.length > 0 ? (
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
                        onClick={() => handleEdit(plan)}
                        className="w-10 h-10 rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 flex items-center justify-center hover:bg-blue-500/30 transition-all"
                      >
                        <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(plan.id)}
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
          ) : (
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
              <p className="text-purple-200/70 mb-6">Dodaj pierwszy plan, aby rozpocząć zarządzanie budżetem</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingPlan(null);
                  setFormData({ category: '', monthlyAmount: '' });
                  setShowForm(true);
                }}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                + Dodaj pierwszy plan
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

