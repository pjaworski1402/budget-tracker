'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { useAuth } from '@/lib/hooks/useAuth';
import PageLayout from '@/app/components/common/PageLayout';
import PageHeader from '@/app/components/common/PageHeader';
import ExpensesChart from '@/app/components/analytics/ExpensesChart';
import SavingsChart from '@/app/components/analytics/SavingsChart';
import InterestChart from '@/app/components/analytics/InterestChart';
import CalendarEvents from '@/app/components/analytics/CalendarEvents';

interface BudgetPlan {
  category: string;
  monthlyAmount: number;
}

interface SavingsAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  interestRate: number | null;
  interestFrequency: string | null;
  targetAmount: number | null;
  maturityDate: string | null;
}

interface User {
  currency: string;
}

export default function AnalyticsPage() {
  const { formatCurrency } = useCurrency();
  const { fetchWithAuth } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<BudgetPlan[]>([]);
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthsToShow, setMonthsToShow] = useState(12);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, accountsRes, userRes] = await Promise.all([
        fetchWithAuth('/api/plans'),
        fetchWithAuth('/api/savings'),
        fetchWithAuth('/api/auth/me'),
      ]);

      const plansData = await plansRes.json();
      const accountsData = await accountsRes.json();
      const userData = await userRes.json();

      if (plansData.success && accountsData.success && userData.success) {
        setPlans(plansData.data.plans);
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


  const [expensesData, setExpensesData] = useState<any[]>([]);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const now = new Date();
        const endDate = new Date(now.getFullYear(), now.getMonth() + monthsToShow, 0);
        
        const response = await fetchWithAuth(
          `/api/payments?startDate=${now.toISOString()}&endDate=${endDate.toISOString()}`
        );

        const totalMonthly = plans.reduce((sum, plan) => sum + Number(plan.monthlyAmount), 0);
        const months = [];
        
        for (let i = 0; i < monthsToShow; i++) {
          const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
          months.push({
            month: date.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' }),
            monthIndex: i,
            expenses: totalMonthly,
          });
        }

        if (response.ok) {
          const data = await response.json();
          const payments = data.success ? data.data.payments.filter((p: any) => !p.isPaid) : [];

          const monthlyTotals: { [key: string]: number } = {};
          
          payments.forEach((payment: any) => {
            const paymentDate = new Date(payment.paymentDate);
            const monthKey = paymentDate.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' });
            if (!monthlyTotals[monthKey]) {
              monthlyTotals[monthKey] = 0;
            }
            monthlyTotals[monthKey] += Number(payment.amount);
          });

          months.forEach((month) => {
            if (monthlyTotals[month.month]) {
              month.expenses = monthlyTotals[month.month];
            }
          });
        }

        setExpensesData(months);
      } catch (err) {
        const now = new Date();
        const totalMonthly = plans.reduce((sum, plan) => sum + Number(plan.monthlyAmount), 0);
        const months = [];
        for (let i = 0; i < monthsToShow; i++) {
          const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
          months.push({
            month: date.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' }),
            monthIndex: i,
            expenses: totalMonthly,
          });
        }
        setExpensesData(months);
      }
    };

    if (!loading) {
      loadExpenses();
    }
  }, [loading, monthsToShow, plans]);

  const calculateSavingsProjection = () => {
    const months = [];
    const now = new Date();
    
    // Inicjalizuj salda dla każdego konta
    const accountBalances = accounts.map((acc) => ({
      id: acc.id,
      balance: Number(acc.balance),
      interestRate: acc.interestRate ? Number(acc.interestRate) : null,
      interestFrequency: acc.interestFrequency,
      type: acc.type,
    }));
    
    // Oblicz początkową sumę oszczędności
    let currentSavings = accountBalances.reduce((sum, acc) => sum + acc.balance, 0);

    for (let i = 0; i < monthsToShow; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      
      // Dla każdego konta oprocentowanego, dodaj odsetki i zaktualizuj saldo
      accountBalances.forEach((account) => {
        if ((account.type === 'interest' || account.type === 'bond') && account.interestRate && account.interestFrequency) {
          const rate = account.interestRate / 100;
          let monthlyRate = 0;
          
          if (account.interestFrequency === 'monthly') {
            monthlyRate = rate / 12;
          } else if (account.interestFrequency === 'yearly') {
            monthlyRate = rate / 12;
          } else if (account.interestFrequency === 'daily') {
            monthlyRate = rate / 365 * 30;
          }
          
          const interest = account.balance * monthlyRate;
          account.balance += interest;
          currentSavings += interest;
        }
      });

      months.push({
        month: date.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' }),
        monthIndex: i,
        savings: Math.round(currentSavings * 100) / 100,
      });
    }
    return months;
  };

  const calculateInterestPayments = () => {
    const months = [];
    const now = new Date();
    
    // Inicjalizuj salda dla każdego konta
    const accountBalances = accounts.map((acc) => ({
      id: acc.id,
      balance: Number(acc.balance),
      interestRate: acc.interestRate ? Number(acc.interestRate) : null,
      interestFrequency: acc.interestFrequency,
      type: acc.type,
    }));
    
    for (let i = 0; i < monthsToShow; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      let totalInterest = 0;

      accountBalances.forEach((account) => {
        if ((account.type === 'interest' || account.type === 'bond') && account.interestRate && account.interestFrequency) {
          const rate = account.interestRate / 100;
          let monthlyInterest = 0;

          if (account.interestFrequency === 'monthly') {
            monthlyInterest = account.balance * (rate / 12);
          } else if (account.interestFrequency === 'yearly') {
            monthlyInterest = i % 12 === 11 ? account.balance * rate : 0;
          } else if (account.interestFrequency === 'daily') {
            monthlyInterest = account.balance * (rate / 365 * 30);
          }

          totalInterest += monthlyInterest;
          
          // Zaktualizuj saldo konta (odsetki są dodawane do salda)
          account.balance += monthlyInterest;
        }
      });

      months.push({
        month: date.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' }),
        monthIndex: i,
        interest: Math.round(totalInterest * 100) / 100,
      });
    }
    return months;
  };

  const getCalendarEvents = () => {
    const events: Array<{ date: Date; title: string; type: string }> = [];
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth() + monthsToShow, 0);

    accounts.forEach((account) => {
      if (account.maturityDate) {
        const maturity = new Date(account.maturityDate);
        if (maturity >= now && maturity <= endDate) {
          events.push({
            date: maturity,
            title: `Termin: ${account.name}`,
            type: 'bond',
          });
        }
      }
      if (account.type === 'goal' && account.targetAmount) {
        const progress = (Number(account.balance) / Number(account.targetAmount)) * 100;
        if (progress < 100) {
          events.push({
            date: now,
            title: `Cel: ${account.name}`,
            type: 'goal',
          });
        }
      }
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const savingsData = calculateSavingsProjection();
  const interestData = calculateInterestPayments();
  const calendarEvents = getCalendarEvents();

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
      <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Analizy i prognozy"
            subtitle="Przewidywane wydatki, oszczędności i wpływy"
            backHref="/dashboard"
          />

          {/* Period selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
          >
            <label className="block text-sm font-medium text-purple-200 mb-3">
              Okres prognozy
            </label>
            <div className="flex gap-2">
              {[6, 12, 24].map((months) => (
                <motion.button
                  key={months}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMonthsToShow(months)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    monthsToShow === months
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  {months} miesięcy
                </motion.button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ExpensesChart data={expensesData} formatCurrency={formatCurrency} />
            <SavingsChart data={savingsData} formatCurrency={formatCurrency} />
            <InterestChart data={interestData} formatCurrency={formatCurrency} />
            <CalendarEvents events={calendarEvents} />
          </div>
      </div>
    </PageLayout>
  );
}

