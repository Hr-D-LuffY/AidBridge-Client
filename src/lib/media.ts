import { MEDIA_ACCEPTED_TYPES, MEDIA_MAX_BYTES } from '@/lib/constants'
import { formatFileSize } from '@/lib/format'

// Browser-side check for SOS photos and videos, so a bad file is refused with a clear reason before
// anything is uploaded. The backend checks the same rules again.

const ACCEPTED = new Set<string>(MEDIA_ACCEPTED_TYPES)

export function isVideo(file: File) {
  return file.type.startsWith('video/')
}

type CheckOptions = {
  // How many more files may be added (the limit minus what the request already has).
  slotsLeft: number
  maxBytes?: number
}

// Splits the files the user just picked into the ones to keep and a plain-language problem per file
// that was refused. Files beyond `slotsLeft` are refused as a group, not one by one.
export function checkMediaFiles(
  picked: readonly File[],
  { slotsLeft, maxBytes = MEDIA_MAX_BYTES }: CheckOptions,
): { accepted: File[]; problems: string[] } {
  const accepted: File[] = []
  const problems: string[] = []
  let overLimit = 0

  for (const file of picked) {
    if (!ACCEPTED.has(file.type)) {
      problems.push(
        `"${file.name}" is not a photo or video we can use (JPG, PNG, GIF, MP4, MOV, AVI).`,
      )
    } else if (file.size > maxBytes) {
      problems.push(
        `"${file.name}" is ${formatFileSize(file.size)}; the limit is ${formatFileSize(maxBytes)}.`,
      )
    } else if (accepted.length >= slotsLeft) {
      overLimit++
    } else {
      accepted.push(file)
    }
  }

  if (overLimit > 0) {
    problems.push(
      slotsLeft === 0
        ? 'No more files can be added to this request.'
        : `Only ${slotsLeft} more ${slotsLeft === 1 ? 'file fits' : 'files fit'}; ${overLimit} not added.`,
    )
  }
  return { accepted, problems }
}
