'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { FileUpload } from '@/components/shared/file-upload'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/api/errors'
import { MEDIA_MAX_FILES } from '@/lib/constants'
import type { MediaItem, SosRequest } from '@/types'
import { useAddSosMedia, useRemoveSosMedia } from '../sos.queries'
import { SosMedia } from './sos-media'

// Adding and removing photos of a request that already exists. It only appears inside the edit sheet,
// so a photo can never be uploaded or deleted by a stray tap on the page you are just reading. (The
// form on the "raise" page attaches photos on the way in; this is for later, or for when that failed.)
export function SosMediaEditor({ sos }: { sos: SosRequest }) {
  const addMedia = useAddSosMedia(sos.id)
  const removeMedia = useRemoveSosMedia(sos.id)
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | undefined>()
  const [removing, setRemoving] = useState<MediaItem | null>(null)

  async function upload() {
    setError(undefined)
    try {
      await addMedia.mutateAsync({ files, onProgress: setProgress })
      setFiles([])
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      setProgress(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Photos and videos</p>

      {sos.media.length > 0 ? (
        <SosMedia media={sos.media} onRemove={setRemoving} />
      ) : (
        <p className="text-sm text-muted-foreground">Nothing attached.</p>
      )}

      {sos.media.length >= MEDIA_MAX_FILES ? (
        <p className="text-sm text-muted-foreground">
          This request has the most files it can hold. Remove one to add another.
        </p>
      ) : (
        <>
          <FileUpload
            label="Add photos or videos"
            files={files}
            onFilesChange={setFiles}
            existingCount={sos.media.length}
            progress={progress}
            error={error}
            disabled={addMedia.isPending}
          />
          {files.length > 0 && (
            <Button
              type="button"
              className="h-11 w-fit px-5"
              disabled={addMedia.isPending}
              onClick={upload}
            >
              Upload {files.length} {files.length === 1 ? 'file' : 'files'}
            </Button>
          )}
        </>
      )}

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(next) => {
          if (!next && !removeMedia.isPending) setRemoving(null)
        }}
        title="Remove this file?"
        description="It is deleted from your request. The volunteer will no longer see it."
        confirmLabel="Remove"
        cancelLabel="Keep it"
        pending={removeMedia.isPending}
        onConfirm={() => {
          if (!removing) return
          removeMedia.mutate(removing.id, {
            onSuccess: () => setRemoving(null),
            onError: (caught) => toast.error(getErrorMessage(caught)),
          })
        }}
      />
    </div>
  )
}
