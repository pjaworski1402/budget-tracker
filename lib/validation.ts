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
  type: z.enum(['current', 'interest', 'goal', 'bond'], {
    message: 'Typ musi być: current, interest, goal lub bond',
  }),
  balance: z.number().min(0, 'Saldo nie może być ujemne').optional().default(0),
  interestRate: z.number().min(0).max(100).optional(),
  interestFrequency: z.enum(['daily', 'monthly', 'yearly']).optional(),
  targetAmount: z.number().positive().optional(),
  maturityDate: z.string().optional(),
});

export const paymentSchema = z.object({
  category: z.string().min(1, 'Kategoria jest wymagana'),
  amount: z.number().positive('Kwota musi być większa od zera'),
  paymentDate: z.string().min(1, 'Data płatności jest wymagana'),
  type: z.enum(['recurring', 'one-time', 'custom'], {
    message: 'Typ musi być: recurring, one-time lub custom',
  }),
  budgetPlanId: z.string().optional(),
  frequency: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  month: z.number().min(0).max(11).optional(), // 0-11 dla yearly (0 = styczeń, 11 = grudzień)
  customDates: z.array(z.string()).optional(),
  isPaid: z.boolean().optional().default(false),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type BudgetPlanInput = z.infer<typeof budgetPlanSchema>;
export type SavingsAccountInput = z.infer<typeof savingsAccountSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;

