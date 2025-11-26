import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { validateSession } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  handleApiError,
} from '@/lib/api-response';
import { paymentSchema } from '@/lib/validation';

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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {
      userId: session.userId,
    };

    if (startDate && endDate) {
      where.paymentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        budgetPlan: true,
      },
      orderBy: { paymentDate: 'asc' },
    });

    return successResponse({ payments });
  } catch (error) {
    return handleApiError(error, 'pobierania płatności');
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validation = paymentSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const paymentData: any = {
      userId: session.userId,
      category: validation.data.category,
      amount: validation.data.amount,
      paymentDate: new Date(validation.data.paymentDate),
      type: validation.data.type,
      isPaid: validation.data.isPaid || false,
    };

    if (validation.data.budgetPlanId) {
      paymentData.budgetPlanId = validation.data.budgetPlanId;
    }

    if (validation.data.type === 'recurring') {
      if (validation.data.frequency) {
        paymentData.frequency = validation.data.frequency;
      }
      if (validation.data.dayOfWeek !== undefined) {
        paymentData.dayOfWeek = validation.data.dayOfWeek;
      }
      if (validation.data.dayOfMonth !== undefined) {
        paymentData.dayOfMonth = validation.data.dayOfMonth;
      }
    }

    if (validation.data.type === 'custom' && validation.data.customDates) {
      paymentData.customDates = JSON.stringify(validation.data.customDates);
    }

    const payment = await prisma.payment.create({
      data: paymentData,
      include: {
        budgetPlan: true,
      },
    });

    if (validation.data.type === 'recurring' && validation.data.frequency) {
      const generatedPayments = await generateRecurringPayments(
        payment,
        validation.data.frequency,
        validation.data.dayOfWeek,
        validation.data.dayOfMonth,
        validation.data.month,
        session.userId
      );
      return successResponse(
        { payment, generatedPayments },
        'Płatność cykliczna została utworzona',
        201
      );
    }

    return successResponse({ payment }, 'Płatność została utworzona', 201);
  } catch (error) {
    return handleApiError(error, 'tworzenia płatności');
  }
}

async function generateRecurringPayments(
  basePayment: any,
  frequency: 'weekly' | 'monthly' | 'yearly',
  dayOfWeek: number | undefined,
  dayOfMonth: number | undefined,
  month: number | undefined,
  userId: string
) {
  const payments = [];
  const startDate = new Date(basePayment.paymentDate);
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 10);

  let currentDate = new Date(startDate);
  let count = 0;
  const maxPayments = frequency === 'weekly' ? 104 : frequency === 'monthly' ? 24 : 10;

  while (currentDate <= endDate && count < maxPayments) {
    if (count > 0) {
      const paymentData: any = {
        userId,
        category: basePayment.category,
        amount: basePayment.amount,
        paymentDate: new Date(currentDate),
        type: 'recurring',
        frequency,
        isPaid: false,
      };

      if (basePayment.budgetPlanId) {
        paymentData.budgetPlanId = basePayment.budgetPlanId;
      }

      if (frequency === 'weekly' && dayOfWeek !== undefined) {
        paymentData.dayOfWeek = dayOfWeek;
      }

      if (frequency === 'monthly' && dayOfMonth !== undefined) {
        paymentData.dayOfMonth = dayOfMonth;
      }

      if (frequency === 'yearly' && dayOfMonth !== undefined) {
        paymentData.dayOfMonth = dayOfMonth;
      }

      const payment = await prisma.payment.create({
        data: paymentData,
      });
      payments.push(payment);
    }

    if (frequency === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (frequency === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
      if (dayOfMonth !== undefined) {
        currentDate.setDate(dayOfMonth);
      }
    } else if (frequency === 'yearly') {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
      if (month !== undefined) {
        currentDate.setMonth(month);
      }
      if (dayOfMonth !== undefined) {
        currentDate.setDate(dayOfMonth);
      }
    }
    count++;
  }

  return payments;
}

