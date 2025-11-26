import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { validateSession } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
  handleApiError,
} from '@/lib/api-response';
import { budgetPlanSchema } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return unauthorizedResponse('Brak tokenu autoryzacyjnego');
    }

    const session = await validateSession(token);

    if (!session) {
      return unauthorizedResponse('Nieprawidłowy lub wygasły token');
    }

    const plan = await prisma.budgetPlan.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!plan) {
      return notFoundResponse('Plan budżetowy nie został znaleziony');
    }

    const body = await request.json();
    const validation = budgetPlanSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const updatedPlan = await prisma.budgetPlan.update({
      where: { id },
      data: {
        category: validation.data.category,
        monthlyAmount: validation.data.monthlyAmount,
      },
    });

    return successResponse({ plan: updatedPlan }, 'Plan budżetowy został zaktualizowany');
  } catch (error) {
    return handleApiError(error, 'aktualizacji planu budżetowego');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return unauthorizedResponse('Brak tokenu autoryzacyjnego');
    }

    const session = await validateSession(token);

    if (!session) {
      return unauthorizedResponse('Nieprawidłowy lub wygasły token');
    }

    const plan = await prisma.budgetPlan.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!plan) {
      return notFoundResponse('Plan budżetowy nie został znaleziony');
    }

    await prisma.budgetPlan.delete({
      where: { id },
    });

    return successResponse(null, 'Plan budżetowy został usunięty');
  } catch (error) {
    return handleApiError(error, 'usuwania planu budżetowego');
  }
}

