'use client'

import { Film, ImagePlus, X } from 'lucide-react'
import Image from 'next/image'
import { type ChangeEvent, useId, useRef, useState } from 'react'
import { UploadProgress } from '@/components/shared/upload-progress'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useObjectUrl } from '@/hooks/use-object-url'
import { MEDIA_ACCEPTED_TYPES, MEDIA_MAX_BYTES, MEDIA_MAX_FILES } from '@/lib/constants'
import { formatFileSize } from '@/lib/format'
import { checkMediaFiles, isVideo } from '@/lib/media'

type FileUploadProps = {
  label: string
  // The files picked but not uploaded yet. The form owns them.
  files: File[]
  onFilesChange: (files: File[]) => void
  onBlur?: () => void
  // Files the request already has on the server. They count against the limit.
  existingCount?: number
  maxFiles?: number
  maxBytes?: number
  // 0 to 100 while the upload runs, otherwise null.
  progress?: number | null
  // A message from the form (the backend refused the upload).
  error?: string
  disabled?: boolean
}

const ACCEPT = MEDIA_ACCEPTED_TYPES.join(',')

function Thumbnail({
  file,
  onRemove,
  disabled,
}: {
  file: File
  onRemove: () => void
  disabled: boolean
}) {
  const previewUrl = useObjectUrl(isVideo(file) ? null : file)

  return (
    <li className="relative flex flex-col gap-1.5">
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-lg bg-muted ring-1 ring-border">
        {previewUrl ? (
          <Image
            unoptimized
            src={previewUrl}
            alt=""
            width={160}
            height={160}
            className="size-full object-cover"
          />
        ) : (
          <Film aria-hidden="true" className="size-8 text-muted-foreground" />
        )}
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="absolute top-1 right-1 rounded-full"
          disabled={disabled}
          onClick={onRemove}
        >
          <X aria-hidden="true" />
          <span className="sr-only">Remove {file.name}</span>
        </Button>
      </div>
      <p className="truncate text-xs" title={file.name}>
        {file.name}
      </p>
      <p className="-mt-1 text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
    </li>
  )
}

// Picks photos and videos for an SOS request and previews them. It does not upload: the form uploads
// on submit and passes the progress back in, so the bar fills while the request runs. Type, size and
// count are checked here, as the files are picked, so the reason shows next to the button.
export function FileUpload({
  label,
  files,
  onFilesChange,
  onBlur,
  existingCount = 0,
  maxFiles = MEDIA_MAX_FILES,
  maxBytes = MEDIA_MAX_BYTES,
  progress = null,
  error,
  disabled,
}: FileUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [problems, setProblems] = useState<string[]>([])

  const slotsLeft = Math.max(0, maxFiles - existingCount - files.length)
  const uploading = progress !== null
  const messages = error ? [error] : problems

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const result = checkMediaFiles(Array.from(event.target.files ?? []), { slotsLeft, maxBytes })
    setProblems(result.problems)
    if (result.accepted.length > 0) onFilesChange([...files, ...result.accepted])
    // So choosing the same file again after removing it still fires a change.
    event.target.value = ''
    onBlur?.()
  }

  function remove(index: number) {
    setProblems([])
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={inputId} className="text-sm">
        {label}
        <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
      </Label>

      <div>
        <Button
          type="button"
          variant="outline"
          className="h-11 px-4"
          disabled={disabled || uploading || slotsLeft === 0}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus aria-hidden="true" />
          {files.length > 0 ? 'Add more' : 'Add photos or videos'}
        </Button>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          disabled={disabled || uploading}
          aria-describedby={`${inputId}-hint`}
          onChange={handleChange}
        />
      </div>

      {files.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {files.map((file, index) => (
            <Thumbnail
              key={`${file.name}-${file.size}-${file.lastModified}`}
              file={file}
              disabled={Boolean(disabled) || uploading}
              onRemove={() => remove(index)}
            />
          ))}
        </ul>
      )}

      {uploading && <UploadProgress label="Upload progress" progress={progress} />}

      {messages.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1 text-sm text-destructive">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <p id={`${inputId}-hint`} className="text-sm text-muted-foreground">
        JPG, PNG, GIF, MP4, MOV or AVI. Up to {maxFiles} files, {formatFileSize(maxBytes)} each
        {existingCount > 0 && ` (${existingCount} already added)`}.
      </p>
    </div>
  )
}
