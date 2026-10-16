'use client'

import { Plus, Tent } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PageHeader } from '@/components/shared/page-header'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryParams } from '@/hooks/use-query-params'
import { NGO_PAGE_SIZE } from '@/lib/constants'
import type { ManagedCamp } from '@/types'
import { toManagedCampsQuery } from '../camp.params'
import { useDeleteCamp, useManagedCampsQuery } from '../camp.queries'
import { AssignVolunteerSheet } from './assign-volunteer-sheet'
import { CampFormSheet } from './camp-form-sheet'
import { NgoCampCard } from './ngo-camp-card'

// null: the sheet is closed. 'new': adding. A camp: editing it.
type FormTarget = 'new' | ManagedCamp | null

// The camps an NGO runs: how full each is, who works there, and the actions to change them. Open camps
// come first. The page is in the URL. Adding, editing and assigning happen in sheets so the list stays
// in view; a camp's id is kept (not the camp) for the sheets that must show the latest team.
export function NgoCampsView() {
  const params = useQueryParams()
  const query = useManagedCampsQuery(toManagedCampsQuery(params.get('page')))
  const remove = useDeleteCamp()
  const [form, setForm] = useState<FormTarget>(null)
  const [assignId, setAssignId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<ManagedCamp | null>(null)

  const camps = query.data?.items ?? []
  // Read from the list on each render, so the sheet shows the team as it is after an assignment.
  const assignCamp = camps.find((camp) => camp.id === assignId) ?? null

  let body: React.ReactNode
  if (query.isPending) {
    body = (
      <div aria-busy="true" className="grid gap-4 lg:grid-cols-2">
        <output className="sr-only">Loading your camps</output>
        {['one', 'two'].map((id) => (
          <Skeleton key={id} className="h-96 rounded-2xl" />
        ))}
      </div>
    )
  } else if (query.isError && !query.data) {
    body = <ListErrorState onRetry={() => query.refetch()} />
  } else if (camps.length === 0) {
    body = (
      <EmptyState
        icon={Tent}
        title="No camps yet"
        description="Add a relief camp so victims nearby can find it, and volunteers can be assigned to hand out its stock."
        action={
          <Button type="button" className="h-10 gap-2 px-4" onClick={() => setForm('new')}>
            <Plus aria-hidden="true" />
            Add your first camp
          </Button>
        }
      />
    )
  } else {
    body = (
      <>
        <ul aria-label="Your camps" className="grid gap-4 lg:grid-cols-2">
          {camps.map((camp) => (
            <li key={camp.id}>
              <NgoCampCard
                camp={camp}
                onEdit={() => setForm(camp)}
                onDelete={() => setToDelete(camp)}
                onAssign={() => setAssignId(camp.id)}
              />
            </li>
          ))}
        </ul>
        {query.data && (
          <PaginationBar
            meta={{ ...query.data.meta, limit: NGO_PAGE_SIZE }}
            onPageChange={params.setPage}
            disabled={query.isFetching}
          />
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Camps"
        description="The relief camps you run. Keep the head count up to date, put volunteers on the team and close a camp when it is no longer needed."
        actions={
          <Button type="button" className="h-11 gap-2 px-5" onClick={() => setForm('new')}>
            <Plus aria-hidden="true" />
            Add camp
          </Button>
        }
      />

      {body}

      {form && (
        <CampFormSheet
          open
          camp={form === 'new' ? null : form}
          onOpenChange={(open) => {
            if (!open) setForm(null)
          }}
        />
      )}

      {assignCamp && (
        <AssignVolunteerSheet
          open
          camp={assignCamp}
          onOpenChange={(open) => {
            if (!open) setAssignId(null)
          }}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null)
        }}
        title={`Delete ${toDelete?.name ?? 'this camp'}?`}
        description="The camp disappears from every list and map, and its volunteers lose it. Its stock is kept and goes back to your general store. This cannot be undone."
        confirmLabel="Delete camp"
        cancelLabel="Keep camp"
        pending={remove.isPending}
        onConfirm={() => {
          if (!toDelete) return
          remove.mutate(toDelete, { onSettled: () => setToDelete(null) })
        }}
      />
    </div>
  )
}
