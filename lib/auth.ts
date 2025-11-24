import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, token: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.session.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: {
      userId,
      token,
      expiresAt,
    } as any,
  });
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: { token } as any,
  });
}

export async function validateSession(token: string): Promise<{ userId: string; email: string } | null> {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const session = await prisma.session.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: { token } as any,
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return {
    userId: session.userId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    email: (session as any).user.email,
  };
}

export async function cleanupExpiredSessions(): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

