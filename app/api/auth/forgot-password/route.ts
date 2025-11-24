import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { forgotPasswordSchema } from '@/lib/validation';
import {
  successResponse,
  validationErrorResponse,
  handleApiError,
} from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    const message = 'Jeśli użytkownik istnieje, email z instrukcjami został wysłany';

    if (!user) {
      return successResponse(null, message);
    }

    const resetToken = generateToken({
      userId: user.id,
      email: user.email,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        updatedAt: new Date(),
      },
    });

    return successResponse({ resetToken }, message);
  } catch (error) {
    if (error && typeof error === 'object' && ('name' in error && error.name === 'ZodError' || 'issues' in error)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return validationErrorResponse(error as any);
    }
    return handleApiError(error, 'przetwarzania żądania resetu hasła');
  }
}

