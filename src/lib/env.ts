import 'server-only'
import { z } from 'zod'

// Server-only environment. Importing this from a Client Component fails the build.
// Every variable is validated once at startup (see src/instrumentation.ts), so a missing or
// malformed value stops the server with a clear message instead of failing on the first request.

// An empty `FOO=` line in .env is treated as "not set".
const optionalText = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional(),
)

const optionalEmail = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.email().optional(),
)

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

// http is fine on this machine; anywhere else it must be https (see the message below).
function isSecureOrLocal(value: string) {
  try {
    const { protocol, hostname } = new URL(value)
    return protocol === 'https:' || LOCAL_HOSTS.has(hostname)
  } catch {
    return true // not a URL at all: the .url() check above reports that
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Backend API base URL, for example http://localhost:5000/api/v1 (no trailing slash needed).
  BACKEND_API_URL: z
    .url('BACKEND_API_URL must be a valid URL, e.g. http://localhost:5000/api/v1')
    .refine(isSecureOrLocal, {
      message:
        'BACKEND_API_URL must start with https:// for a hosted backend. A redirect from http to https drops the Authorization header, so every signed-in request would fail with 401.',
    })
    .transform((url) => url.replace(/\/+$/, '')),

  // Credentials behind the one-click demo buttons. Optional so the app still boots without them: a
  // role with no pair has a disabled "not set up yet" button, and the demo-login route refuses it.
  DEMO_VICTIM_EMAIL: optionalEmail,
  DEMO_VICTIM_PASSWORD: optionalText,
  DEMO_VOLUNTEER_EMAIL: optionalEmail,
  DEMO_VOLUNTEER_PASSWORD: optionalText,
  DEMO_NGO_EMAIL: optionalEmail,
  DEMO_NGO_PASSWORD: optionalText,
  DEMO_ADMIN_EMAIL: optionalEmail,
  DEMO_ADMIN_PASSWORD: optionalText,
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`)
  }
  return result.data
}

export const env = loadEnv()
