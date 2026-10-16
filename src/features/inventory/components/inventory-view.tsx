'use client'

import { PackageOpen, Pencil, Plus, SearchX, Trash2, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { FilterChips } from '@/components/shared/filter-chips'
import { PageHeader } from '@/components/shared/page-header'
import { getReliefLabel, RELIEF_CATEGORY_OPTIONS } from '@/components/shared/relief-category'
import { SelectFilter } from '@/components/shared/select-filter'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCampOptionsQuery } from '@/features/camp/camp.queries'
import { useQueryParams } from '@/hooks/use-query-params'
import { NGO_PAGE_SIZE } from '@/lib/constants'
import type { InventoryItem } from '@/types'
import { parseInventoryParams, toInventoryQuery } from '../inventory.params'
import { useDeleteItem, useInventoryQuery } from '../inventory.queries'
import { ItemFormSheet } from './item-form-sheet'
import { QuantityEditor } from './quantity-editor'

// null: the sheet is closed. 'new': adding. An item: editing it.
type SheetTarget = 'new' | InventoryItem | null

const LOW_OPTIONS = [{ value: 'low', label: 'Running low' }] as const

// The NGO's stock: what it holds, where, and how much. Filters (camp, category, running low) and the page
// live in the URL. The amount is edited in the row; everything else in a sheet. Whether an item is
// running low comes from the backend (`isLow`), never from a comparison made here.
export function InventoryView() {
  const params = useQueryParams()
  const view = parseInventoryParams({
    page: params.get('page'),
    camp: params.get('camp'),
    category: params.get('category'),
    low: params.get('low'),
  })
  const query = useInventoryQuery(toInventoryQuery(view))
  const camps = useCampOptionsQuery()
  const remove = useDeleteItem()
  const [sheet, setSheet] = useState<SheetTarget>(null)
  const [toDelete, setToDelete] = useState<InventoryItem | null>(null)

  const filtered = Boolean(view.camp || view.category || view.lowOnly)

  const columns: DataTableColumn<InventoryItem>[] = [
    {
      id: 'item',
      header: 'Item',
      primary: true,
      cell: (item) => (
        <div className="flex flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2 font-semibold">
            {item.itemName}
            {item.isLow && (
              <Badge variant="secondary" className="h-6 bg-warning-soft px-2.5 text-warning">
                <TriangleAlert aria-hidden="true" />
                Running low
              </Badge>
            )}
          </span>
          <span className="text-sm text-muted-foreground">{getReliefLabel(item.category)}</span>
        </div>
      ),
    },
    {
      id: 'camp',
      header: 'Kept in',
      cell: (item) =>
        item.camp ? (
          <span>
            {item.camp.name}
            {!item.camp.isActive && <span className="text-muted-foreground"> (closed)</span>}
          </span>
        ) : (
          <span className="text-muted-foreground">General store</span>
        ),
    },
    { id: 'quantity', header: 'In stock', cell: (item) => <QuantityEditor item={item} /> },
    {
      id: 'threshold',
      header: 'Low at',
      cell: (item) => (
        <span className="tabular-nums">
          {item.lowStockThreshold} {item.unit}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      actions: true,
      align: 'right',
      cell: (item) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-1.5 px-3"
            onClick={() => setSheet(item)}
          >
            <Pencil aria-hidden="true" />
            Edit
            <span className="sr-only"> {item.itemName}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-1.5 px-3 text-destructive hover:text-destructive"
            onClick={() => setToDelete(item)}
          >
            <Trash2 aria-hidden="true" />
            Delete
            <span className="sr-only"> {item.itemName}</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventory"
        description="What your NGO holds and where it is kept. Volunteers hand out from the camp they are assigned to, and you see the items running low first."
        actions={
          <Button type="button" className="h-11 gap-2 px-5" onClick={() => setSheet('new')}>
            <Plus aria-hidden="true" />
            Add item
          </Button>
        }
      />

      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
          <SelectFilter
            label="Camp"
            allLabel="All camps"
            value={view.camp}
            options={(camps.data?.items ?? []).map((camp) => ({
              value: camp.id,
              label: camp.name,
            }))}
            onChange={(camp) => params.set({ camp })}
          />
        </div>
        <FilterChips
          label="Category"
          options={RELIEF_CATEGORY_OPTIONS}
          value={view.category}
          onChange={(category) => params.set({ category })}
        />
        <FilterChips
          label="Stock"
          allLabel="Everything"
          options={LOW_OPTIONS}
          value={view.lowOnly ? 'low' : undefined}
          onChange={(low) => params.set({ low: low ? '1' : undefined })}
        />
        {filtered && (
          <div>
            <Button
              type="button"
              variant="outline"
              className="h-10 px-4"
              onClick={() => params.clear('camp', 'category', 'low')}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      <DataTable
        label="Your stock"
        columns={columns}
        rows={query.data?.items}
        getRowId={(item) => item.id}
        isLoading={query.isPending}
        isFetching={query.isFetching}
        isError={query.isError}
        onRetry={() => query.refetch()}
        skeletonRows={NGO_PAGE_SIZE}
        pagination={
          query.data && {
            meta: { ...query.data.meta, limit: NGO_PAGE_SIZE },
            onPageChange: params.setPage,
          }
        }
        empty={
          filtered ? (
            <EmptyState
              icon={SearchX}
              title="No items match"
              description="Nothing in your stock fits these filters. Clear them to see everything."
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 px-4"
                  onClick={() => params.clear('camp', 'category', 'low')}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={PackageOpen}
              title="No stock yet"
              description="Add the food, water, medicine and other aid you hold. Items kept in a camp can be handed out by the volunteers assigned there."
              action={
                <Button type="button" className="h-10 gap-2 px-4" onClick={() => setSheet('new')}>
                  <Plus aria-hidden="true" />
                  Add the first item
                </Button>
              }
            />
          )
        }
      />

      {sheet && (
        <ItemFormSheet
          open
          item={sheet === 'new' ? null : sheet}
          onOpenChange={(open) => {
            if (!open) setSheet(null)
          }}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null)
        }}
        title={`Remove ${toDelete?.itemName ?? 'this item'}?`}
        description="It is taken out of your stock. Hand-outs already recorded keep the item's name, so your history stays correct."
        confirmLabel="Remove item"
        cancelLabel="Keep item"
        pending={remove.isPending}
        onConfirm={() => {
          if (!toDelete) return
          remove.mutate(toDelete, { onSettled: () => setToDelete(null) })
        }}
      />
    </div>
  )
}
