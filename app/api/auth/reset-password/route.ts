import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, verifyToken } from '@/lib/auth';
import { resetPasswordSchema } from '@/lib/validation';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  handleApiError,
} from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    const payload = verifyToken(validatedData.token);

    if (!payload) {
      return errorResponse('Nieprawidłowy lub wygasły token', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return notFoundResponse('Użytkownik nie został znaleziony');
    }

    const hashedPassword = await hashPassword(validatedData.password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });

    return successResponse(null, 'Hasło zostało zresetowane pomyślnie');
  } catch (error) {
    if (error && typeof error === 'object' && ('name' in error && error.name === 'ZodError' || 'issues' in error)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return validationErrorResponse(error as any);
    }
    return handleApiError(error, 'resetowania hasła');
  }
}

