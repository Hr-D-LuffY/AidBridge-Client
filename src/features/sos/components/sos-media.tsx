'use client'

import { ImageOff, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { type MediaItem, MediaResourceType } from '@/types'

function MediaTile({
  item,
  index,
  onRemove,
}: {
  item: MediaItem
  index: number
  onRemove?: () => void
}) {
  const [broken, setBroken] = useState(false)
  const label = `${item.resourceType === MediaResourceType.VIDEO ? 'Video' : 'Photo'} ${index + 1}`

  return (
    <li className="relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-border">
      {item.resourceType === MediaResourceType.VIDEO ? (
        <video
          src={item.url}
          preload="metadata"
          controls
          aria-label={label}
          className="size-full object-cover"
        >
          <track kind="captions" />
        </video>
      ) : broken ? (
        <div className="grid size-full place-items-center text-muted-foreground">
          <ImageOff aria-hidden="true" className="size-8" />
          <span className="sr-only">{label} could not be loaded</span>
        </div>
      ) : (
        <Image
          src={item.url}
          alt={label}
          fill
          sizes="(min-width: 1024px) 14rem, 33vw"
          className="object-cover"
          onError={() => setBroken(true)}
        />
      )}
      {onRemove && (
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="absolute top-1.5 right-1.5 rounded-full shadow"
          onClick={onRemove}
        >
          <X aria-hidden="true" />
          <span className="sr-only">Remove {label}</span>
        </Button>
      )}
    </li>
  )
}

// The photos and videos on a request. `onRemove` is only given while the victim can still change it.
export function SosMedia({
  media,
  onRemove,
}: {
  media: MediaItem[]
  onRemove?: (item: MediaItem) => void
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {media.map((item, index) => (
        <MediaTile
          key={item.id}
          item={item}
          index={index}
          onRemove={onRemove && (() => onRemove(item))}
        />
      ))}
    </ul>
  )
}
