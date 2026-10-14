import { z } from 'zod'
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_PATTERN,
  RESET_TOKEN_PATTERN,
} from '@/lib/constants'

// Mirror the backend's schemas (auth.interface.ts, user.interface.ts). The route handlers validate with
// them on the server, and the forms pass them to TanStack Form as the validator.

const emailField = z.email('A valid email is required').toLowerCase()

// The password policy for NEW passwords (sign-up, reset). Login accepts whatever the account has.
export const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number')

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required').max(PASSWORD_MAX_LENGTH),
})

export type LoginInput = z.input<typeof loginSchema>
export type LoginPayload = z.output<typeof loginSchema>

const nameField = z
  .string()
  .trim()
  .min(NAME_MIN_LENGTH, `Name must be at least ${NAME_MIN_LENGTH} characters`)
  .max(NAME_MAX_LENGTH, `Name must be at most ${NAME_MAX_LENGTH} characters`)

const phoneField = z
  .string()
  .trim()
  .regex(PHONE_PATTERN, 'Phone must be 7-15 digits, optionally starting with +')

// What POST /auth/register accepts. Public sign-up is victim-only: there is no role field, and the
// backend answers 400 if one is sent. The phone is optional here, but a volunteer request later needs it.
export const registerSchema = z.object({
  name: nameField,
  email: emailField,
  password: newPasswordSchema,
  phone: phoneField.optional(),
})

export type RegisterInput = z.input<typeof registerSchema>
export type RegisterPayload = z.output<typeof registerSchema>

// The form keeps phone as plain text (blank allowed) and adds a confirmation the backend never sees.
export const registerFormSchema = z
  .object({
    name: nameField,
    email: emailField,
    phone: z
      .string()
      .trim()
      .refine((value) => value === '' || PHONE_PATTERN.test(value), {
        message: 'Phone must be 7-15 digits, optionally starting with +',
      }),
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterFormInput = z.input<typeof registerFormSchema>

// Form values -> request body: drop the confirmation and omit a blank phone (the backend rejects "").
export function toRegisterInput(values: RegisterFormInput): RegisterInput {
  const { name, email, password } = values
  const phone = values.phone.trim()
  return phone ? { name, email, password, phone } : { name, email, password }
}

export const forgotPasswordSchema = z.object({ email: emailField })
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>

export const resetTokenSchema = z.string().regex(RESET_TOKEN_PATTERN)

export const resetPasswordFormSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormInput = z.input<typeof resetPasswordFormSchema>

export const demoLoginSchema = z.object({ role: z.enum(['victim', 'volunteer', 'ngo', 'admin']) })
