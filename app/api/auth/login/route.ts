import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, generateToken, createSession } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  handleApiError,
} from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Nieprawidłowy format JSON', 400);
    }

    const validatedData = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return unauthorizedResponse('Nieprawidłowy email lub hasło');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isPasswordValid = await verifyPassword(validatedData.password, (user as any).password);

    if (!isPasswordValid) {
      return unauthorizedResponse('Nieprawidłowy email lub hasło');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    await createSession(user.id, token);

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: (user as any).name,
      currency: user.currency,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return successResponse(
      { user: userWithoutPassword, token },
      'Logowanie zakończone pomyślnie'
    );
  } catch (error) {
    if (error && typeof error === 'object' && ('name' in error && error.name === 'ZodError' || 'issues' in error)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return validationErrorResponse(error as any);
    }
    return handleApiError(error, 'logowania');
  }
}

