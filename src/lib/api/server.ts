import 'server-only'
import { cookies, headers } from 'next/headers'
import { TOKEN_COOKIE } from '@/lib/constants'
import { env } from '@/lib/env'
import { createApiClient } from './core'

// For Server Components, route handlers and server code. Calls the backend directly and attaches
// the access token from the httpOnly cookie, and passes on the visitor's IP. Browser code uses
// lib/api/client.ts instead.
export const serverApi = createApiClient({
  baseURL: env.BACKEND_API_URL,
  async getHeaders(): Promise<Record<string, string>> {
    const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()])
    const token = cookieStore.get(TOKEN_COOKIE)?.value
    // The visitor's real IP, so the backend's per-IP rate limit counts each visitor on their own
    // instead of seeing every server-rendered page come from one hosting address.
    const clientIp = requestHeaders.get('x-forwarded-for')
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(clientIp && { 'x-forwarded-for': clientIp }),
    }
  },
})
