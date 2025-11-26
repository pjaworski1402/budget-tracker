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
import { paymentSchema } from '@/lib/validation';

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

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!payment) {
      return notFoundResponse('Płatność nie została znaleziona');
    }

    const body = await request.json();
    const validation = paymentSchema.partial().safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const updateData: any = {};

    if (validation.data.category !== undefined) {
      updateData.category = validation.data.category;
    }
    if (validation.data.amount !== undefined) {
      updateData.amount = validation.data.amount;
    }
    if (validation.data.paymentDate !== undefined) {
      updateData.paymentDate = new Date(validation.data.paymentDate);
    }
    if (validation.data.isPaid !== undefined) {
      updateData.isPaid = validation.data.isPaid;
    }
    if (validation.data.budgetPlanId !== undefined) {
      updateData.budgetPlanId = validation.data.budgetPlanId || null;
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        budgetPlan: true,
      },
    });

    return successResponse({ payment: updatedPayment }, 'Płatność została zaktualizowana');
  } catch (error) {
    return handleApiError(error, 'aktualizacji płatności');
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

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!payment) {
      return notFoundResponse('Płatność nie została znaleziona');
    }

    await prisma.payment.delete({
      where: { id },
    });

    return successResponse(null, 'Płatność została usunięta');
  } catch (error) {
    return handleApiError(error, 'usuwania płatności');
  }
}

