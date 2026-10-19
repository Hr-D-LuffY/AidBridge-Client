// Every backend enum, defined once as an `as const` object plus a union type of the same name.
// The values are exactly what the API sends (lowercase). Mirrors server/src/app/constants.

export const Role = {
  VICTIM: 'victim',
  VOLUNTEER: 'volunteer',
  NGO: 'ngo',
  ADMIN: 'admin',
} as const
export type Role = (typeof Role)[keyof typeof Role]

export const SosStatus = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  ON_THE_WAY: 'on_the_way',
  RESCUED: 'rescued',
  CLOSED: 'closed',
} as const
export type SosStatus = (typeof SosStatus)[keyof typeof SosStatus]

// How GET /sos orders a list. `priority` is critical first, newest first inside each level.
export const SosSort = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  PRIORITY: 'priority',
} as const
export type SosSort = (typeof SosSort)[keyof typeof SosSort]

export const TaskStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  ON_THE_WAY: 'on_the_way',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  // An offer nobody answered in time (terminal).
  EXPIRED: 'expired',
} as const
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

// Who made an offer (Task `offer.source`). `null` is a task the volunteer took on their own.
export const OfferSource = {
  AUTO: 'auto',
  ADMIN: 'admin',
  NGO: 'ngo',
} as const
export type OfferSource = (typeof OfferSource)[keyof typeof OfferSource]

// What happened to a request (GET /sos/:id/timeline, `type`; API.md 12d). Later steps add values, so an
// item's `type` is typed as a plain string and anything unknown reads as a general update.
export const SosEventType = {
  OFFERED: 'offered',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  OFFERS_WITHDRAWN: 'offers_withdrawn',
  ESCALATED: 'escalated',
  PRIORITY_RAISED: 'priority_raised',
  UNSERVED: 'unserved',
  SET_OFF_TIMEOUT: 'set_off_timeout',
  BACKED_OUT: 'backed_out',
  ON_THE_WAY: 'on_the_way',
  COMPLETED: 'completed',
} as const
export type SosEventType = (typeof SosEventType)[keyof typeof SosEventType]

// Shared by SOS requests and incidents.
export const Priority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const
export type Priority = (typeof Priority)[keyof typeof Priority]

// What a victim asks for (SOS `needs`) and how inventory items are grouped: the same six kinds.
export const ReliefCategory = {
  FOOD: 'food',
  MEDICINE: 'medicine',
  SHELTER: 'shelter',
  WATER: 'water',
  CLOTHING: 'clothing',
  OTHER: 'other',
} as const
export type ReliefCategory = (typeof ReliefCategory)[keyof typeof ReliefCategory]

// What a volunteer can do (PUT /auth/me `skills`) and what a victim can ask for (SOS `requiredSkills`).
export const Skill = {
  MEDICAL: 'medical',
  FIRST_AID: 'first_aid',
  SEARCH_RESCUE: 'search_rescue',
  BOAT: 'boat',
  DRIVING: 'driving',
  FOOD_DISTRIBUTION: 'food_distribution',
  SHELTER_MANAGEMENT: 'shelter_management',
  COUNSELLING: 'counselling',
} as const
export type Skill = (typeof Skill)[keyof typeof Skill]

export const DisasterType = {
  FLOOD: 'flood',
  EARTHQUAKE: 'earthquake',
  FIRE: 'fire',
  CYCLONE: 'cyclone',
  LANDSLIDE: 'landslide',
  OTHER: 'other',
} as const
export type DisasterType = (typeof DisasterType)[keyof typeof DisasterType]

export const IncidentStatus = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
} as const
export type IncidentStatus = (typeof IncidentStatus)[keyof typeof IncidentStatus]

export const VolunteerRequestStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const
export type VolunteerRequestStatus =
  (typeof VolunteerRequestStatus)[keyof typeof VolunteerRequestStatus]

export const ResolvedBy = {
  VICTIM: 'victim',
  ADMIN: 'admin',
} as const
export type ResolvedBy = (typeof ResolvedBy)[keyof typeof ResolvedBy]

export const MediaResourceType = {
  IMAGE: 'image',
  VIDEO: 'video',
} as const
export type MediaResourceType = (typeof MediaResourceType)[keyof typeof MediaResourceType]

// A notification goes to everyone ('all') or to one or more roles.
export const ALL_ROLES_TARGET = 'all'
export type NotificationTarget = typeof ALL_ROLES_TARGET | Role

export const SosLinkAction = {
  LINK: 'link',
  UNLINK: 'unlink',
} as const
export type SosLinkAction = (typeof SosLinkAction)[keyof typeof SosLinkAction]

// What an audit entry is about (GET /audit-logs, `targetType`).
export const AuditTargetType = {
  USER: 'user',
  VOLUNTEER_REQUEST: 'volunteer_request',
  SOS_REQUEST: 'sos_request',
  INCIDENT: 'incident',
  CAMP: 'camp',
  NOTIFICATION: 'notification',
} as const
export type AuditTargetType = (typeof AuditTargetType)[keyof typeof AuditTargetType]

// The `action` values the backend records so far (API.md 12b). New ones arrive with later steps, so an
// entry's `action` is typed as a plain string and the label map falls back for one it does not know.
export const AuditAction = {
  ACCOUNT_CREATED: 'account_created',
  USER_BLOCKED: 'user_blocked',
  USER_UNBLOCKED: 'user_unblocked',
  VOLUNTEER_REQUEST_APPROVED: 'volunteer_request_approved',
  VOLUNTEER_REQUEST_REJECTED: 'volunteer_request_rejected',
  SOS_PRIORITY_CHANGED: 'sos_priority_changed',
  INCIDENT_CREATED: 'incident_created',
  INCIDENT_UPDATED: 'incident_updated',
  INCIDENT_PRIORITY_CHANGED: 'incident_priority_changed',
  INCIDENT_SOS_LINKED: 'incident_sos_linked',
  INCIDENT_SOS_UNLINKED: 'incident_sos_unlinked',
  INCIDENT_DELETED: 'incident_deleted',
  CAMP_VOLUNTEER_ASSIGNED: 'camp_volunteer_assigned',
  CAMP_VOLUNTEER_UNASSIGNED: 'camp_volunteer_unassigned',
  CAMP_DELETED: 'camp_deleted',
  BROADCAST_SENT: 'broadcast_sent',
} as const
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction]

// Which group a notification belongs to (GET /notifications, `category`). The page groups by it.
export const NotificationCategory = {
  REQUESTS: 'requests',
  TASKS: 'tasks',
  CAMPS: 'camps',
  SAFETY: 'safety',
  SYSTEM: 'system',
} as const
export type NotificationCategory = (typeof NotificationCategory)[keyof typeof NotificationCategory]

// What a notification is about (GET /notifications, `type`; API.md 11b). Later steps add values, so an
// item's `type` is typed as a plain string and anything unknown is shown as `general`.
export const NotificationType = {
  GENERAL: 'general',
  BROADCAST: 'broadcast',
  CHAT_MESSAGE: 'chat_message',
  SOS_ASSIGNED: 'sos_assigned',
  SOS_ON_THE_WAY: 'sos_on_the_way',
  SOS_RESCUED: 'sos_rescued',
  SOS_UPDATED: 'sos_updated',
  TASK_CANCELLED: 'task_cancelled',
  VOLUNTEER_BACKED_OUT: 'volunteer_backed_out',
  VOLUNTEER_REQUEST_APPROVED: 'volunteer_request_approved',
  VOLUNTEER_REQUEST_REJECTED: 'volunteer_request_rejected',
  INVENTORY_LOW: 'inventory_low',
  TASK_OFFERED: 'task_offered',
  OFFER_EXPIRED: 'offer_expired',
  SOS_UNSERVED: 'sos_unserved',
} as const
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]
