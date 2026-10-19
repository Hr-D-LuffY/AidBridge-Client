import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { DispatchSettingsView } from '@/features/dispatch/components/settings-view'
import { dispatchKeys } from '@/features/dispatch/dispatch.keys'
import { getDispatchSettings } from '@/features/dispatch/dispatch.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Dispatch settings' }

// The settings are fetched here and handed to the client view through the query cache, so the first paint
// already has them. A failure is not fatal: prefetchQuery swallows it and the view shows its own error state.
export default async function DispatchSettingsPage() {
  const queryClient = makeQueryClient()
  await queryClient.prefetchQuery({
    queryKey: dispatchKeys.settings(),
    queryFn: getDispatchSettings,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DispatchSettingsView />
    </HydrationBoundary>
  )
}
