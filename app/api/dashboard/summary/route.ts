import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { validateSession } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  handleApiError,
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return unauthorizedResponse('Brak tokenu autoryzacyjnego');
    }

    const session = await validateSession(token);

    if (!session) {
      return unauthorizedResponse('Nieprawidłowy lub wygasły token');
    }

    const [budgetPlans, savingsAccounts] = await Promise.all([
      prisma.budgetPlan.findMany({
        where: { userId: session.userId },
      }),
      prisma.savingsAccount.findMany({
        where: { userId: session.userId },
      }),
    ]);

    const totalBudget = budgetPlans.reduce(
      (sum, plan) => sum + Number(plan.monthlyAmount),
      0
    );

    const totalSavings = savingsAccounts.reduce(
      (sum, account) => sum + Number(account.balance),
      0
    );

    const totalTargetSavings = savingsAccounts
      .filter((account) => account.targetAmount)
      .reduce((sum, account) => sum + Number(account.targetAmount || 0), 0);

    const budgetAlerts = budgetPlans.filter((plan) => {
      const amount = Number(plan.monthlyAmount);
      return amount > 0;
    });

    const summary = {
      totalBudget,
      totalSavings,
      totalTargetSavings,
      budgetPlansCount: budgetPlans.length,
      savingsAccountsCount: savingsAccounts.length,
      budgetAlertsCount: budgetAlerts.length,
      recentPlans: budgetPlans.slice(0, 3),
      recentAccounts: savingsAccounts.slice(0, 3),
    };

    return successResponse(summary);
  } catch (error) {
    return handleApiError(error, 'pobierania podsumowania dashboard');
  }
}

