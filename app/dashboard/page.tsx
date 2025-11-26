'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/app/components/common/PageLayout';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import SummaryCard from '@/app/components/SummaryCard';
import QuickLinks from '@/app/components/dashboard/QuickLinks';
import RecentPlans from '@/app/components/dashboard/RecentPlans';
import RecentAccounts from '@/app/components/dashboard/RecentAccounts';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { useAuth } from '@/lib/hooks/useAuth';

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
  const { formatCurrency } = useCurrency();
  const { fetchWithAuth, logout } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, userRes] = await Promise.all([
          fetchWithAuth('/api/dashboard/summary'),
          fetchWithAuth('/api/auth/me'),
        ]);

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
  }, [fetchWithAuth]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Ładowanie...</div>
        </div>
      </PageLayout>
    );
  }

  if (error || !summary) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl text-center">
            <p className="text-red-200 mb-4">{error || 'Nie udało się załadować danych'}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold"
            >
              Zaloguj się ponownie
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        <DashboardHeader
          userName={user?.name || user?.email}
          onLogout={logout}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Całkowity budżet"
            value={formatCurrency(summary.totalBudget)}
            subtitle={`${summary.budgetPlansCount} planów`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            iconColor="purple"
            delay={0.1}
          />
          <SummaryCard
            title="Oszczędności"
            value={formatCurrency(summary.totalSavings)}
            subtitle={`${summary.savingsAccountsCount} kont`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            iconColor="blue"
            delay={0.2}
          />
          <SummaryCard
            title="Cele oszczędnościowe"
            value={formatCurrency(summary.totalTargetSavings)}
            subtitle="Łączny cel"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 001.946.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
            iconColor="pink"
            delay={0.3}
          />
          <SummaryCard
            title="Alerty budżetowe"
            value={summary.budgetAlertsCount}
            subtitle="Aktywne alerty"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            iconColor="yellow"
            delay={0.4}
          />
        </div>

        <QuickLinks />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RecentPlans plans={summary.recentPlans} formatCurrency={formatCurrency} />
          <RecentAccounts accounts={summary.recentAccounts} formatCurrency={formatCurrency} />
        </div>
      </div>
    </PageLayout>
  );
}

