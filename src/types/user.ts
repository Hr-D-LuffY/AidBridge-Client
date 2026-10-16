import type { Role } from './enums'

// GeoJSON point, as the backend stores and returns it. Coordinates are [lng, lat].
export type GeoPoint = {
  type: 'Point'
  coordinates: [number, number]
}

// GET /auth/me, PUT /auth/me and the `user` in the login response.
export type UserProfile = {
  id: string
  name: string
  role: Role
  isAvailable: boolean
  reliabilityScore: number
  totalRatings: number
  email: string
  phone?: string | null
  location: GeoPoint | null
  // An admin can block an account. Only an admin (or the user themself, who cannot be blocked while
  // reading it) gets this profile, so these are what the admin's Users pages show.
  isBlocked?: boolean
  blockedAt?: string | null
  // Written by the admin who blocked it, for other admins. Never shown to the blocked person.
  blockReason?: string | null
  createdAt: string
  updatedAt: string
}

// POST /auth/login and POST /auth/register: a single access token, no refresh token.
export type AuthResult = {
  token: string
  user: UserProfile
}

// What the token carries. The role is only right at sign-in time: an approved volunteer request changes
// the role in the database without a new token, so area layouts re-check GET /auth/me.
export type AccessTokenPayload = {
  id: string
  role: Role
  iat: number
  exp: number
}

// The small copy of the user kept in the ab_session cookie, for the first paint and the route guard.
export type SessionUser = {
  id: string
  name: string
  role: Role
}

// PUT /auth/me takes any of these (at least one). Email and role cannot be changed.
export type UpdateProfilePayload = {
  name?: string
  phone?: string
  // [lng, lat]
  location?: [number, number]
  isAvailable?: boolean
}

// A volunteer as an NGO sees them (GET /users?role=volunteer): the limited profile plus the contact
// details it needs to coordinate camps.
export type VolunteerContact = {
  id: string
  name: string
  role: Role
  isAvailable: boolean
  reliabilityScore: number
  totalRatings: number
  email: string
  phone: string | null
}

export type VolunteerListParams = {
  page?: number
  limit?: number
  role: 'volunteer'
}

// GET /users. An admin gets full profiles; an NGO gets the limited one (see VolunteerContact).
export type UserListParams = {
  page?: number
  limit?: number
  role?: Role
  // Admin only: true lists the blocked accounts, false the others.
  blocked?: boolean
}

// POST /users (admin): an NGO or another admin. The admin picks the first password and hands it over.
export type CreateAccountPayload = {
  name: string
  email: string
  password: string
  role: 'ngo' | 'admin'
  phone?: string
}
