import { registerSchema } from '@/features/auth/auth.schema'
import { jsonFromError, jsonFromZod, jsonSuccess, readJson } from '@/lib/api/respond'
import { signUp } from '@/lib/auth/sign-in'

export const maxDuration = 60

// POST /api/auth/register { name, email, password, phone? }
// Creates a victim account (public sign-up has no role field) and signs it in.
export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonFromZod(parsed.error)

  try {
    const session = await signUp(parsed.data, request.headers.get('x-forwarded-for'))
    return jsonSuccess('Account created successfully', session, 201)
  } catch (error) {
    return jsonFromError(error)
  }
}
