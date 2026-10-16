import { z } from 'zod'
import { nameField, newPasswordSchema } from '@/features/auth/auth.schema'
import { PASSWORD_MAX_LENGTH, PHONE_PATTERN } from '@/lib/constants'
import type { UpdateProfilePayload, UserProfile } from '@/types'

// The details form. Phone stays plain text here (blank allowed for an account that never had one).
export const profileFormSchema = z.object({
  name: nameField,
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || PHONE_PATTERN.test(value), {
      message: 'Phone must be 7-15 digits, optionally starting with +',
    }),
})

export type ProfileFormInput = z.input<typeof profileFormSchema>

// True once the form differs from what is saved (the save button stays off until then).
export function hasProfileEdits(
  values: ProfileFormInput,
  profile: Pick<UserProfile, 'name' | 'phone'>,
): boolean {
  return values.name.trim() !== profile.name || values.phone.trim() !== (profile.phone ?? '')
}

export const PHONE_REMOVE_MESSAGE = 'A phone number can be changed but not removed.'

// Only what changed: the backend refuses an empty body. A blank phone is never sent (it would be a 400);
// the form tells the user a saved number cannot be removed.
export function toProfileChanges(
  values: ProfileFormInput,
  profile: Pick<UserProfile, 'name' | 'phone'>,
): UpdateProfilePayload {
  const changes: UpdateProfilePayload = {}
  const name = values.name.trim()
  const phone = values.phone.trim()
  if (name !== profile.name) changes.name = name
  if (phone !== '' && phone !== (profile.phone ?? '')) changes.phone = phone
  return changes
}

// The old password only has to be present (it is checked by the backend); the new one follows the
// password policy and must differ.
export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password').max(PASSWORD_MAX_LENGTH),
    newPassword: newPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: 'The new password must be different from the current one',
    path: ['newPassword'],
  })

export type ChangePasswordFormInput = z.input<typeof changePasswordFormSchema>

// The body of POST /api/auth/change-password (our route handler), which the browser and the
// handler both validate.
export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password').max(PASSWORD_MAX_LENGTH),
  newPassword: newPasswordSchema,
})

export type ChangePasswordBody = z.output<typeof changePasswordBodySchema>

// "Add an account" (admin): an NGO or another admin. The admin chooses the first password and hands it
// over, so it is typed once and can be shown. Phone is optional and stays plain text (blank allowed).
export const createAccountFormSchema = z.object({
  name: nameField,
  email: z.email('A valid email is required').toLowerCase(),
  role: z.string().refine((value) => value === 'ngo' || value === 'admin', 'Choose a role'),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || PHONE_PATTERN.test(value), {
      message: 'Phone must be 7-15 digits, optionally starting with +',
    }),
  password: newPasswordSchema,
})

export type CreateAccountFormInput = z.input<typeof createAccountFormSchema>
