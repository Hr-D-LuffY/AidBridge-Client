import { AuditAction, AuditTargetType } from '@/types'

// The words for each recorded action: one map, so the filter and the table agree.
export const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  [AuditAction.ACCOUNT_CREATED]: 'Account created',
  [AuditAction.USER_BLOCKED]: 'Account blocked',
  [AuditAction.USER_UNBLOCKED]: 'Account unblocked',
  [AuditAction.VOLUNTEER_REQUEST_APPROVED]: 'Volunteer request approved',
  [AuditAction.VOLUNTEER_REQUEST_REJECTED]: 'Volunteer request not approved',
  [AuditAction.SOS_PRIORITY_CHANGED]: 'SOS priority changed',
  [AuditAction.INCIDENT_CREATED]: 'Incident created',
  [AuditAction.INCIDENT_UPDATED]: 'Incident updated',
  [AuditAction.INCIDENT_PRIORITY_CHANGED]: 'Incident priority changed',
  [AuditAction.INCIDENT_SOS_LINKED]: 'Requests linked to incident',
  [AuditAction.INCIDENT_SOS_UNLINKED]: 'Requests unlinked from incident',
  [AuditAction.INCIDENT_DELETED]: 'Incident deleted',
  [AuditAction.CAMP_VOLUNTEER_ASSIGNED]: 'Volunteer assigned to camp',
  [AuditAction.CAMP_VOLUNTEER_UNASSIGNED]: 'Volunteer removed from camp',
  [AuditAction.CAMP_DELETED]: 'Camp deleted',
  [AuditAction.BROADCAST_SENT]: 'Broadcast sent',
}

export const AUDIT_TARGET_LABEL: Record<AuditTargetType, string> = {
  [AuditTargetType.USER]: 'Account',
  [AuditTargetType.VOLUNTEER_REQUEST]: 'Volunteer request',
  [AuditTargetType.SOS_REQUEST]: 'SOS request',
  [AuditTargetType.INCIDENT]: 'Incident',
  [AuditTargetType.CAMP]: 'Camp',
  [AuditTargetType.NOTIFICATION]: 'Broadcast',
}

function isKnown<T extends string>(map: Record<T, string>, key: string): key is T {
  return key in map
}

// Later backend steps add actions, so an unknown one reads as its own words ("dispatch_paused" becomes
// "Dispatch paused") instead of breaking the page.
function humanize(value: string) {
  const text = value.replaceAll('_', ' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function getAuditActionLabel(action: string) {
  return isKnown(AUDIT_ACTION_LABEL, action) ? AUDIT_ACTION_LABEL[action] : humanize(action)
}

export function getAuditTargetLabel(targetType: string) {
  return isKnown(AUDIT_TARGET_LABEL, targetType)
    ? AUDIT_TARGET_LABEL[targetType]
    : humanize(targetType)
}

// The admin page of the record an entry is about, where there is one. A camp has no page of its own for
// an admin, a volunteer request and a broadcast are rows in a list, and a deleted record has nothing to open.
export function getAuditTargetHref(entry: {
  action: string
  targetType: string
  targetId: string
}): string | undefined {
  if (entry.action.endsWith('_deleted')) return undefined
  switch (entry.targetType) {
    case AuditTargetType.USER:
      return `/admin/users/${entry.targetId}`
    case AuditTargetType.SOS_REQUEST:
      return `/admin/sos/${entry.targetId}`
    case AuditTargetType.INCIDENT:
      return `/admin/incidents/${entry.targetId}`
    default:
      return undefined
  }
}

// The one free-text field an entry may carry that the summary leaves out: a block reason or a review
// note. Shown as plain text under the summary.
export function getAuditNote(meta: Record<string, unknown>): string | undefined {
  for (const key of ['reason', 'note']) {
    const value = meta[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return undefined
}
