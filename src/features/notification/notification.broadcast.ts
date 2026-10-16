import { z } from 'zod'
import {
  ADMIN_PAGE_SIZE,
  BROADCAST_MESSAGE_MAX_LENGTH,
  BROADCAST_TITLE_MAX_LENGTH,
  DEFAULT_PAGE,
  ROLE_LABEL,
} from '@/lib/constants'
import {
  ALL_ROLES_TARGET,
  type NotificationListParams,
  type NotificationTarget,
  Role,
} from '@/types'

// The admin's broadcast composer. Mirrors the backend's createNotificationSchema
// (notification.interface.ts): `all` stands alone, and an emergency broadcast also sends an email.

export const BROADCAST_TARGETS: readonly { value: NotificationTarget; label: string }[] = [
  { value: ALL_ROLES_TARGET, label: 'Everyone' },
  ...Object.values(Role).map((role) => ({ value: role, label: `${ROLE_LABEL[role]}s` })),
]

const TARGET_VALUES = BROADCAST_TARGETS.map((target) => target.value)

export const broadcastSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Write a title')
    .max(
      BROADCAST_TITLE_MAX_LENGTH,
      `Title must be at most ${BROADCAST_TITLE_MAX_LENGTH} characters`,
    ),
  message: z
    .string()
    .trim()
    .min(1, 'Write the message')
    .max(
      BROADCAST_MESSAGE_MAX_LENGTH,
      `Message must be at most ${BROADCAST_MESSAGE_MAX_LENGTH} characters`,
    ),
  targetRoles: z
    .array(z.string().refine((value) => TARGET_VALUES.some((target) => target === value)))
    .min(1, 'Choose who should get it'),
  isEmergencyBroadcast: z.boolean(),
})

export type BroadcastInput = z.input<typeof broadcastSchema>

// The roles a target list reaches, in words ("volunteers and NGOs"), for the confirmation.
export function describeTargets(targets: readonly string[]): string {
  if (targets.includes(ALL_ROLES_TARGET)) return 'everyone with an account'
  const labels = BROADCAST_TARGETS.filter((target) => targets.includes(target.value)).map(
    (target) => target.label.toLowerCase(),
  )
  if (labels.length <= 1) return labels[0] ?? 'nobody'
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}

// The history lists what is addressed to the admin (everyone, or admins), a page at a time.
export function toBroadcastHistoryQuery(rawPage: string | undefined): NotificationListParams {
  const page = Number(rawPage)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    limit: ADMIN_PAGE_SIZE,
  }
}
