import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, generateToken, createSession } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
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

    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return errorResponse('Użytkownik o tym adresie email już istnieje', 400);
    }

    const hashedPassword = await hashPassword(validatedData.password);

    const createdUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });

    const user = {
      id: createdUser.id,
      email: createdUser.email,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: (createdUser as any).name,
      currency: createdUser.currency,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    await createSession(user.id, token);

    return successResponse(
      { user, token },
      'Rejestracja zakończona pomyślnie',
      201
    );
  } catch (error) {
    if (error && typeof error === 'object' && ('name' in error && error.name === 'ZodError' || 'issues' in error)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return validationErrorResponse(error as any);
    }
    return handleApiError(error, 'rejestracji');
  }
}

