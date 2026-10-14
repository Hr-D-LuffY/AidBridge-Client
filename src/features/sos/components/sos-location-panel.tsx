'use client'

import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { MapsLocation02Icon } from '@/components/icons/maps-location-02-icon'
import { LocationMap } from '@/components/shared/location-map'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fromGeoPoint } from '@/lib/geo'
import type { SosRequest } from '@/types'

// Where the request is. Normally it is one button; the map opens large in a modal (the ✕ in the
// corner, Escape or a tap outside closes it) and only loads once it is opened.
export function SosLocationPanel({ sos }: { sos: SosRequest }) {
  const [open, setOpen] = useState(false)

  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:p-5">
      <h2 className="text-base font-semibold">Location</h2>

      <button
        type="button"
        data-pulse={!open}
        onClick={() => setOpen(true)}
        className="map-button flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-xl border border-info/40 bg-info-soft px-4 py-2 text-sm font-medium text-info outline-none transition-colors hover:bg-info-soft/70 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <MapsLocation02Icon size={22} />
        View on map
      </button>

      {sos.address && (
        <p className="flex items-start gap-2 text-sm">
          <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          {sos.address}
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request location</DialogTitle>
            <DialogDescription className="line-clamp-2">
              {sos.address || 'Where this request was sent from.'}
            </DialogDescription>
          </DialogHeader>
          <LocationMap
            className="h-[70dvh] min-h-72 w-full"
            position={fromGeoPoint(sos.location)}
            readOnly
            scrollZoom
          />
        </DialogContent>
      </Dialog>
    </section>
  )
}
