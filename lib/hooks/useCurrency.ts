import { useState, useEffect } from 'react';

export function useCurrency() {
  const [currency, setCurrency] = useState<string>('PLN');

  useEffect(() => {
    const fetchUserCurrency = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.user?.currency) {
            setCurrency(data.data.user.currency);
          }
        }
      } catch (err) {
        // Ignore errors, use default currency
      }
    };

    fetchUserCurrency();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return { currency, formatCurrency };
}

