import { changePasswordBodySchema } from '@/features/user/user.schema'
import { jsonFailure, jsonFromError, jsonFromZod, jsonSuccess, readJson } from '@/lib/api/respond'
import { serverApi } from '@/lib/api/server'
import { getSession, startSession } from '@/lib/auth/session'

// A hosted free-tier backend can take about a minute to wake up, so the host must not cut this off first.
export const maxDuration = 60

// POST /api/auth/change-password { currentPassword, newPassword }
// Not the generic /api/backend proxy, for two reasons. The backend answers with a fresh token and
// rejects every older one, so the cookie has to be rewritten here or the user would be logged out
// right after saving. And a wrong current password is a 401, which the proxy would read as "the
// session is dead" and clear the cookies for.
export async function POST(request: Request) {
  const parsed = changePasswordBodySchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonFromZod(parsed.error)

  const session = await getSession()
  if (!session) return jsonFailure(401, 'Your session has ended. Log in again.')

  try {
    const { data } = await serverApi.request<{ token: string }>('/auth/change-password', {
      method: 'PUT',
      body: parsed.data,
    })
    if (!(await startSession(data.token, session))) {
      return jsonFailure(
        502,
        'Your password was changed, but we could not keep you signed in. Log in again with the new password.',
      )
    }
    return jsonSuccess('Password changed', null)
  } catch (error) {
    return jsonFromError(error)
  }
}
