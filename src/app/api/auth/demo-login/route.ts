import { demoLoginSchema } from '@/features/auth/auth.schema'
import { jsonFailure, jsonFromError, jsonFromZod, jsonSuccess, readJson } from '@/lib/api/respond'
import { getDemoCredentials } from '@/lib/auth/demo-credentials'
import { signIn } from '@/lib/auth/sign-in'

export const maxDuration = 60

// POST /api/auth/demo-login { role: "victim" | "volunteer" | "ngo" | "admin" }
// The browser only says which role. The credentials are looked up here, on the server.
export async function POST(request: Request) {
  const parsed = demoLoginSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonFromZod(parsed.error)

  const credentials = getDemoCredentials(parsed.data.role)
  if (!credentials) return jsonFailure(503, 'This demo account is not set up yet.')

  try {
    const session = await signIn(credentials, request.headers.get('x-forwarded-for'))
    return jsonSuccess('Logged in successfully', session)
  } catch (error) {
    return jsonFromError(error)
  }
}
