import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { validateSession } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  handleApiError,
} from '@/lib/api-response';
import { savingsAccountSchema } from '@/lib/validation';

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

    const accounts = await prisma.savingsAccount.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ accounts });
  } catch (error) {
    return handleApiError(error, 'pobierania kont oszczędnościowych');
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
    const validation = savingsAccountSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const account = await prisma.savingsAccount.create({
      data: {
        userId: session.userId,
        name: validation.data.name,
        type: validation.data.type,
        balance: validation.data.balance || 0,
        interestRate: validation.data.interestRate || null,
        interestFrequency: validation.data.interestFrequency || null,
        targetAmount: validation.data.targetAmount || null,
        maturityDate: validation.data.maturityDate ? new Date(validation.data.maturityDate) : null,
      },
    });

    return successResponse({ account }, 'Konto oszczędnościowe zostało utworzone', 201);
  } catch (error) {
    return handleApiError(error, 'tworzenia konta oszczędnościowego');
  }
}

