'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageLayout from '@/app/components/common/PageLayout';
import PageHeader from '@/app/components/common/PageHeader';
import SummaryCard from '@/app/components/SummaryCard';
import SavingsForm from '@/app/components/savings/SavingsForm';
import SavingsList from '@/app/components/savings/SavingsList';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { useAuth } from '@/lib/hooks/useAuth';

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

interface User {
  currency: string;
}

export default function SavingsPage() {
  const { formatCurrency } = useCurrency();
  const { fetchWithAuth } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SavingsAccount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'current' as 'current' | 'interest' | 'goal' | 'bond',
    balance: '',
    interestRate: '',
    interestFrequency: 'monthly' as 'daily' | 'monthly' | 'yearly',
    targetAmount: '',
    maturityDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, userRes] = await Promise.all([
        fetchWithAuth('/api/savings'),
        fetchWithAuth('/api/auth/me'),
      ]);

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

      if ((formData.type === 'interest' || formData.type === 'bond') && formData.interestRate) {
        const rate = parseFloat(formData.interestRate);
        if (rate < 0 || rate > 100) {
          setError('Oprocentowanie musi być między 0 a 100%');
          setSubmitting(false);
          return;
        }
        payload.interestRate = rate;
        payload.interestFrequency = formData.interestFrequency;
      }

      if (formData.type === 'goal') {
        if (formData.targetAmount) {
          const target = parseFloat(formData.targetAmount);
          if (target <= 0) {
            setError('Kwota celu musi być większa od zera');
            setSubmitting(false);
            return;
          }
          payload.targetAmount = target;
        }
      }

      if (formData.type === 'bond' && formData.maturityDate) {
        payload.maturityDate = formData.maturityDate;
      }

      const url = editingAccount ? `/api/savings/${editingAccount.id}` : '/api/savings';
      const method = editingAccount ? 'PATCH' : 'POST';

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
      setEditingAccount(null);
      setFormData({ name: '', type: 'current', balance: '', interestRate: '', interestFrequency: 'monthly', targetAmount: '', maturityDate: '' });
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
      interestFrequency: (account.interestFrequency as 'daily' | 'monthly' | 'yearly') || 'monthly',
      targetAmount: account.targetAmount?.toString() || '',
      maturityDate: account.maturityDate ? new Date(account.maturityDate).toISOString().split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to konto?')) return;

    try {
      const response = await fetchWithAuth(`/api/savings/${id}`, {
        method: 'DELETE',
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

  const totalSavings = accounts.reduce((sum, account) => sum + account.balance, 0);
  const totalTargets = accounts
    .filter((a) => a.targetAmount)
    .reduce((sum, account) => sum + (account.targetAmount || 0), 0);

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
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Konta oszczędnościowe"
          subtitle="Zarządzaj swoimi oszczędnościami"
          backHref="/dashboard"
          actionButton={
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingAccount(null);
                setFormData({ name: '', type: 'current', balance: '', interestRate: '', interestFrequency: 'monthly', targetAmount: '', maturityDate: '' });
                setShowForm(true);
              }}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              + Dodaj konto
            </motion.button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SummaryCard
            title="Całkowite oszczędności"
            value={formatCurrency(totalSavings)}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            iconColor="blue"
            delay={0.1}
          />
          <SummaryCard
            title="Cele oszczędnościowe"
            value={formatCurrency(totalTargets)}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 001.946.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
            iconColor="pink"
            delay={0.2}
          />
        </div>

        {showForm && (
          <SavingsForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingAccount(null);
              setFormData({ name: '', type: 'current', balance: '', interestRate: '', interestFrequency: 'monthly', targetAmount: '', maturityDate: '' });
            }}
            submitting={submitting}
            error={error}
            editingAccount={editingAccount}
            budgetPlans={[]}
          />
        )}

        <SavingsList
          accounts={accounts}
          formatCurrency={formatCurrency}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={() => {
            setEditingAccount(null);
            setFormData({ name: '', type: 'current', balance: '', interestRate: '', interestFrequency: 'monthly', targetAmount: '', maturityDate: '' });
            setShowForm(true);
          }}
        />
      </div>
    </PageLayout>
  );
}

