'use client'

import { CircleCheck, Loader2, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel: string
  // The safe choice. Say what it keeps ("Keep request"), not just "Cancel".
  cancelLabel?: string
  onConfirm: () => void
  // Disables both buttons while the action runs.
  pending?: boolean
  // An input the action needs, e.g. the reason for resolving an SOS. The caller owns its state.
  children?: ReactNode
  // Keeps "Confirm" off until the input in `children` is valid.
  confirmDisabled?: boolean
  // 'danger' (red, a warning sign) for something that cannot be undone or takes something away.
  // 'neutral' (blue, a tick) for a step the user wants but should not hit by accident, like "I have
  // arrived".
  tone?: 'danger' | 'neutral'
}

// Every destructive or irreversible action (resolve or close an SOS, delete a camp, incident, stock
// item or account, reject a volunteer request) asks here first. Focus is trapped and Escape
// cancels. The caller closes it, so it can stay open while a request runs.
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  pending = false,
  children,
  confirmDisabled = false,
  tone = 'danger',
}: ConfirmDialogProps) {
  const danger = tone === 'danger'
  const Icon = danger ? TriangleAlert : CircleCheck
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia
            className={danger ? 'bg-destructive-soft text-destructive' : 'bg-info-soft text-info'}
          >
            <Icon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel className="h-10 px-4" disabled={pending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={danger ? 'destructive' : 'default'}
            className="h-10 px-4"
            disabled={pending || confirmDisabled}
            onClick={onConfirm}
          >
            {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
