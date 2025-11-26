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

    const updateData: any = {
      name: validation.data.name,
      type: validation.data.type,
      balance: validation.data.balance !== undefined ? validation.data.balance : Number(account.balance),
    };

    if (validation.data.interestRate !== undefined) {
      updateData.interestRate = validation.data.interestRate;
    } else if (account.interestRate !== null && account.interestRate !== undefined) {
      updateData.interestRate = Number(account.interestRate);
    }

    if (validation.data.interestFrequency !== undefined) {
      updateData.interestFrequency = validation.data.interestFrequency;
    } else if ((account as any).interestFrequency !== null && (account as any).interestFrequency !== undefined) {
      updateData.interestFrequency = (account as any).interestFrequency;
    }

    if (validation.data.targetAmount !== undefined) {
      updateData.targetAmount = validation.data.targetAmount;
    } else if (account.targetAmount !== null && account.targetAmount !== undefined) {
      updateData.targetAmount = Number(account.targetAmount);
    }

    if (validation.data.maturityDate !== undefined) {
      updateData.maturityDate = validation.data.maturityDate ? new Date(validation.data.maturityDate) : null;
    } else if ((account as any).maturityDate !== null && (account as any).maturityDate !== undefined) {
      updateData.maturityDate = new Date((account as any).maturityDate);
    }

    const updatedAccount = await prisma.savingsAccount.update({
      where: { id },
      data: updateData,
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

