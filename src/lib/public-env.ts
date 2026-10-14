import { z } from 'zod'

// Browser-safe environment. Next only inlines NEXT_PUBLIC_* values that are written out in full,
// so each one is read explicitly rather than passing process.env wholesale.
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .url('NEXT_PUBLIC_APP_URL must be a valid URL, e.g. http://localhost:3000')
    .transform((url) => url.replace(/\/+$/, '')),
  // Where the contact form's email goes (it opens the visitor's own email app or webmail). Leave it blank
  // and the contact form is disabled with a notice, so it never pretends to send anything.
  NEXT_PUBLIC_CONTACT_EMAIL: z.email('NEXT_PUBLIC_CONTACT_EMAIL must be a valid email').optional(),
})

const result = publicEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL || undefined,
})

if (!result.success) {
  throw new Error(`Invalid public environment variables:\n${z.prettifyError(result.error)}`)
}

export const publicEnv = result.data
