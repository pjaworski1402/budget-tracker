import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { validateSession } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  handleApiError,
} from '@/lib/api-response';
import { budgetPlanSchema } from '@/lib/validation';

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

    const plans = await prisma.budgetPlan.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ plans });
  } catch (error) {
    return handleApiError(error, 'pobierania planów budżetowych');
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
    const validation = budgetPlanSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const plan = await prisma.budgetPlan.create({
      data: {
        userId: session.userId,
        category: validation.data.category,
        monthlyAmount: validation.data.monthlyAmount,
      },
    });

    return successResponse({ plan }, 'Plan budżetowy został utworzony', 201);
  } catch (error) {
    return handleApiError(error, 'tworzenia planu budżetowego');
  }
}

