import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: 'Nieprawidłowy adres email' }),
  password: z.string().min(6, 'Hasło musi mieć minimum 6 znaków'),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Email jest wymagany').email({ message: 'Nieprawidłowy adres email' }),
  password: z.string().min(1, 'Hasło jest wymagane'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Nieprawidłowy adres email' }),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token jest wymagany'),
  password: z.string().min(6, 'Hasło musi mieć minimum 6 znaków'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

