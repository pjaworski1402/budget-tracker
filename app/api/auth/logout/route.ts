import { NextRequest } from 'next/server';
import { deleteSession } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  handleApiError,
} from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return unauthorizedResponse('Brak tokenu autoryzacyjnego');
    }

    await deleteSession(token);

    return successResponse(null, 'Wylogowano pomyślnie');
  } catch (error) {
    return handleApiError(error, 'wylogowania');
  }
}

