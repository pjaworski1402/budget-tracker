'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageLayout from '@/app/components/common/PageLayout';
import PageHeader from '@/app/components/common/PageHeader';
import PaymentForm from '@/app/components/payments/PaymentForm';
import PaymentList from '@/app/components/payments/PaymentList';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { useAuth } from '@/lib/hooks/useAuth';

interface Payment {
  id: string;
  category: string;
  amount: number;
  paymentDate: string;
  type: 'recurring' | 'one-time' | 'custom';
  frequency?: 'weekly' | 'monthly' | 'yearly' | null;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  customDates?: string | null;
  isPaid: boolean;
  budgetPlanId?: string | null;
  budgetPlan?: {
    category: string;
  } | null;
}

interface BudgetPlan {
  id: string;
  category: string;
}

interface User {
  currency: string;
}

export default function PaymentsPage() {
  const { formatCurrency } = useCurrency();
  const { fetchWithAuth } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    paymentDate: '',
    type: 'one-time' as 'recurring' | 'one-time' | 'custom',
    budgetPlanId: '',
    frequency: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    month: 0, // 0 = styczeń, 11 = grudzień
    customDates: [] as string[],
    isPaid: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, plansRes, userRes] = await Promise.all([
        fetchWithAuth('/api/payments'),
        fetchWithAuth('/api/plans'),
        fetchWithAuth('/api/auth/me'),
      ]);

      const paymentsData = await paymentsRes.json();
      const plansData = await plansRes.json();
      const userData = await userRes.json();

      if (plansData.success) {
        setBudgetPlans(plansData.data.plans);
      }

      if (userData.success) {
        setUser(userData.data.user);
      }

      if (paymentsData.success) {
        setPayments(paymentsData.data.payments || []);
      } else {
        setPayments([]);
      }

      if (!plansData.success || !userData.success) {
        setError('Nie udało się załadować niektórych danych');
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
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        setError('Kwota musi być większa od zera');
        setSubmitting(false);
        return;
      }

      if (formData.type === 'recurring' && !formData.paymentDate) {
        setError('Data pierwszej płatności jest wymagana');
        setSubmitting(false);
        return;
      }

      if (formData.type === 'custom' && formData.customDates.length === 0) {
        setError('Dodaj przynajmniej jedną datę płatności');
        setSubmitting(false);
        return;
      }

      const payload: any = {
        category: formData.category,
        amount,
        paymentDate: formData.paymentDate || formData.customDates[0] || new Date().toISOString().split('T')[0],
        type: formData.type,
        isPaid: formData.isPaid,
      };

      if (formData.budgetPlanId) {
        payload.budgetPlanId = formData.budgetPlanId;
      }

      if (formData.type === 'recurring') {
        payload.frequency = formData.frequency;
        if (formData.frequency === 'weekly') {
          payload.dayOfWeek = formData.dayOfWeek;
        } else if (formData.frequency === 'monthly') {
          payload.dayOfMonth = formData.dayOfMonth;
        } else if (formData.frequency === 'yearly') {
          payload.dayOfMonth = formData.dayOfMonth;
          payload.month = formData.month;
        }
      }

      if (formData.type === 'custom') {
        payload.customDates = formData.customDates;
      }

      const url = editingPayment ? `/api/payments/${editingPayment.id}` : '/api/payments';
      const method = editingPayment ? 'PATCH' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
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
      setEditingPayment(null);
      resetForm();
      await fetchData();
    } catch (err) {
      setError('Wystąpił błąd podczas zapisywania');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      paymentDate: '',
      type: 'one-time',
      budgetPlanId: '',
      frequency: 'monthly',
      dayOfWeek: 1,
      dayOfMonth: 1,
      month: 0,
      customDates: [],
      isPaid: false,
    });
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    const paymentDate = new Date(payment.paymentDate);
    setFormData({
      category: payment.category,
      amount: payment.amount.toString(),
      paymentDate: paymentDate.toISOString().split('T')[0],
      type: payment.type,
      budgetPlanId: payment.budgetPlanId || '',
      frequency: payment.frequency || 'monthly',
      dayOfWeek: payment.dayOfWeek || 1,
      dayOfMonth: payment.dayOfMonth || 1,
      month: payment.frequency === 'yearly' ? paymentDate.getMonth() : 0,
      customDates: payment.customDates ? JSON.parse(payment.customDates) : [],
      isPaid: payment.isPaid,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę płatność?')) return;

    try {
      const response = await fetchWithAuth(`/api/payments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
      } else {
        setError('Nie udało się usunąć płatności');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas usuwania');
    }
  };

  const addCustomDate = () => {
    setFormData({
      ...formData,
      customDates: [...formData.customDates, ''],
    });
  };

  const updateCustomDate = (index: number, date: string) => {
    const newDates = [...formData.customDates];
    newDates[index] = date;
    setFormData({ ...formData, customDates: newDates });
  };

  const removeCustomDate = (index: number) => {
    const newDates = formData.customDates.filter((_, i) => i !== index);
    setFormData({ ...formData, customDates: newDates });
  };


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

  const upcomingPayments = payments
    .filter((p) => !p.isPaid && new Date(p.paymentDate) >= new Date())
    .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime())
    .slice(0, 10);

  const totalUpcoming = upcomingPayments.reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Ładowanie...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Płatności"
          subtitle="Zarządzaj terminami i kwotami płatności"
          backHref="/dashboard"
          actionButton={
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingPayment(null);
                resetForm();
                setShowForm(true);
              }}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              + Dodaj płatność
            </motion.button>
          }
        />

        {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-purple-200 text-sm font-medium mb-1">Nadchodzące płatności</h3>
                <p className="text-3xl font-bold text-white">{formatCurrency(totalUpcoming)}</p>
                <p className="text-purple-200/70 text-sm mt-1">{upcomingPayments.length} płatności</p>
              </div>
              <div className="w-16 h-16 rounded-xl bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </motion.div>

        {showForm && (
          <PaymentForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingPayment(null);
              resetForm();
            }}
            submitting={submitting}
            error={error}
            editingPayment={editingPayment}
            budgetPlans={budgetPlans}
            onAddCustomDate={addCustomDate}
            onUpdateCustomDate={updateCustomDate}
            onRemoveCustomDate={removeCustomDate}
          />
        )}

        <PaymentList
          payments={payments}
          formatCurrency={formatCurrency}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={() => {
            setEditingPayment(null);
            resetForm();
            setShowForm(true);
          }}
        />
      </div>
    </PageLayout>
  );
}

