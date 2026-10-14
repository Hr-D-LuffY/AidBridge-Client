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

export const TaskStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  ON_THE_WAY: 'on_the_way',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

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
