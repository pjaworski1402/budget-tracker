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

export const budgetPlanSchema = z.object({
  category: z.string().min(1, 'Kategoria jest wymagana'),
  monthlyAmount: z.number().positive('Kwota musi być większa od zera'),
});

export const savingsAccountSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana'),
  type: z.enum(['current', 'interest', 'goal'], {
    message: 'Typ musi być: current, interest lub goal',
  }),
  balance: z.number().min(0, 'Saldo nie może być ujemne').optional().default(0),
  interestRate: z.number().min(0).max(100).optional(),
  targetAmount: z.number().positive().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type BudgetPlanInput = z.infer<typeof budgetPlanSchema>;
export type SavingsAccountInput = z.infer<typeof savingsAccountSchema>;

