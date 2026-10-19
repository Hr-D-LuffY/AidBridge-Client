import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { DispatchSettingsResult } from '@/types'

// The same endpoint for Server Components, which call the backend directly.
export function getDispatchSettings(): Promise<DispatchSettingsResult> {
  return serverApi.get<DispatchSettingsResult>('/dispatch/settings')
}
