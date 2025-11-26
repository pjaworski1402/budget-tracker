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
import { savingsAccountSchema } from '@/lib/validation';

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

    const account = await prisma.savingsAccount.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!account) {
      return notFoundResponse('Konto oszczędnościowe nie zostało znalezione');
    }

    const body = await request.json();
    const validation = savingsAccountSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const updatedAccount = await prisma.savingsAccount.update({
      where: { id },
      data: {
        name: validation.data.name,
        type: validation.data.type,
        balance: validation.data.balance || account.balance,
        interestRate: validation.data.interestRate !== undefined ? validation.data.interestRate : account.interestRate,
        targetAmount: validation.data.targetAmount !== undefined ? validation.data.targetAmount : account.targetAmount,
      },
    });

    return successResponse({ account: updatedAccount }, 'Konto oszczędnościowe zostało zaktualizowane');
  } catch (error) {
    return handleApiError(error, 'aktualizacji konta oszczędnościowego');
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

    const account = await prisma.savingsAccount.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!account) {
      return notFoundResponse('Konto oszczędnościowe nie zostało znalezione');
    }

    await prisma.savingsAccount.delete({
      where: { id },
    });

    return successResponse(null, 'Konto oszczędnościowe zostało usunięte');
  } catch (error) {
    return handleApiError(error, 'usuwania konta oszczędnościowego');
  }
}

