'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageLayout from '@/app/components/common/PageLayout';
import PageHeader from '@/app/components/common/PageHeader';
import SummaryCard from '@/app/components/SummaryCard';
import PlanForm from '@/app/components/plans/PlanForm';
import PlanList from '@/app/components/plans/PlanList';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { useAuth } from '@/lib/hooks/useAuth';

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
  const { formatCurrency } = useCurrency();
  const { fetchWithAuth } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<BudgetPlan[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BudgetPlan | null>(null);
  const [formData, setFormData] = useState({ category: '', monthlyAmount: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, userRes] = await Promise.all([
        fetchWithAuth('/api/plans'),
        fetchWithAuth('/api/auth/me'),
      ]);

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

    try {
      const amount = parseFloat(formData.monthlyAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Kwota musi być większa od zera');
        setSubmitting(false);
        return;
      }

      const url = editingPlan ? `/api/plans/${editingPlan.id}` : '/api/plans';
      const method = editingPlan ? 'PATCH' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
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

    try {
      const response = await fetchWithAuth(`/api/plans/${id}`, {
        method: 'DELETE',
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

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Ładowanie...</div>
        </div>
      </PageLayout>
    );
  }

  const totalBudget = plans.reduce((sum, plan) => sum + plan.monthlyAmount, 0);

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Plany budżetowe"
          subtitle="Zarządzaj swoimi kategoriami wydatków"
          backHref="/dashboard"
          actionButton={
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
          }
        />

        <div className="mb-8">
          <SummaryCard
            title="Całkowity budżet miesięczny"
            value={formatCurrency(totalBudget)}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            iconColor="purple"
            delay={0.1}
          />
        </div>

        {showForm && (
          <PlanForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingPlan(null);
              setFormData({ category: '', monthlyAmount: '' });
            }}
            submitting={submitting}
            error={error}
            editingPlan={editingPlan}
          />
        )}

        {plans.length === 0 && !showForm && (
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

        {plans.length > 0 && (
          <PlanList
            plans={plans}
            formatCurrency={formatCurrency}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </PageLayout>
  );
}

