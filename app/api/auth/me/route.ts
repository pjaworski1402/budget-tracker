import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { validateSession } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
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

    const foundUser = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!foundUser) {
      return notFoundResponse('Użytkownik nie został znaleziony');
    }

    const user = {
      id: foundUser.id,
      email: foundUser.email,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: (foundUser as any).name,
      currency: foundUser.currency,
      createdAt: foundUser.createdAt,
      updatedAt: foundUser.updatedAt,
    };

    return successResponse({ user });
  } catch (error) {
    return handleApiError(error, 'pobierania danych użytkownika');
  }
}

