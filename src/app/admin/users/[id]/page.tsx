import { Ban, Mail, MapPin, Phone, Star } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/shared/page-header'
import { SkillBadges } from '@/components/shared/skill-chips'
import { StatusBadge } from '@/components/shared/status-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Badge } from '@/components/ui/badge'
import { BlockAccountPanel } from '@/features/user/components/block-account-panel'
import { DutyBadge, describeDuty } from '@/features/user/components/duty-status'
import { getUser } from '@/features/user/user.server'
import { isApiError } from '@/lib/api/errors'
import { RATING_MAX } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { fromGeoPoint, getDirectionsUrl } from '@/lib/geo'
import { Role } from '@/types'

export const metadata: Metadata = { title: 'Account' }

type PageProps = { params: Promise<{ id: string }> }

const LINK =
  'inline-flex min-h-11 items-center gap-2 rounded-md text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50'

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

// One account, read only: an admin sees who they are and how to reach them. A malformed or unknown id
// shows the area's "not found" page.
export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params

  let user: Awaited<ReturnType<typeof getUser>>
  try {
    user = await getUser(id)
  } catch (error) {
    if (isApiError(error) && [400, 403, 404].includes(error.status)) notFound()
    throw error
  }

  const isVolunteer = user.role === Role.VOLUNTEER
  const position = user.location ? fromGeoPoint(user.location) : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader back={{ href: '/admin/users', label: 'Users' }} title={user.name} />

      <section className="flex flex-col gap-5 rounded-2xl border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <UserAvatar name={user.name} size={56} />
          <div className="flex flex-col gap-1.5">
            <p className="text-lg font-semibold">{user.name}</p>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge kind="role" status={user.role} />
              {user.isBlocked && (
                <Badge
                  variant="secondary"
                  className="h-6 bg-destructive-soft px-2.5 text-destructive"
                >
                  <Ban aria-hidden="true" />
                  Blocked
                </Badge>
              )}
            </div>
          </div>
        </div>

        <dl className="grid gap-5 sm:grid-cols-2">
          <Detail label="Email">
            <a href={`mailto:${user.email}`} className={`${LINK} break-all`}>
              <Mail aria-hidden="true" className="size-4 shrink-0" />
              {user.email}
            </a>
          </Detail>
          <Detail label="Phone">
            {user.phone ? (
              <a href={`tel:${user.phone}`} className={LINK}>
                <Phone aria-hidden="true" className="size-4" />
                {user.phone}
              </a>
            ) : (
              <span className="text-muted-foreground">No phone number</span>
            )}
          </Detail>
          {isVolunteer && (
            <>
              <Detail label="Availability">
                {user.isAvailable ? 'Available for requests' : 'Not available'}
              </Detail>
              <Detail label="Duty">
                <span className="flex flex-wrap items-center gap-2">
                  <DutyBadge isOnDuty={user.isOnDuty} />
                  <span className="text-sm">{describeDuty(user)}</span>
                </span>
              </Detail>
              <Detail label="Rating">
                <span className="inline-flex items-center gap-1.5">
                  <Star aria-hidden="true" className="size-4" />
                  {user.totalRatings > 0
                    ? `${user.reliabilityScore.toFixed(1)} / ${RATING_MAX} from ${user.totalRatings} ${user.totalRatings === 1 ? 'rating' : 'ratings'}`
                    : 'Not rated yet'}
                </span>
              </Detail>
            </>
          )}
          {isVolunteer && (
            <>
              <Detail label="Skills">
                {user.skills.length > 0 ? (
                  <SkillBadges skills={user.skills} />
                ) : (
                  <span className="text-muted-foreground">None added</span>
                )}
              </Detail>
              <Detail label="Languages">
                {user.languages.length > 0 ? (
                  user.languages.join(', ')
                ) : (
                  <span className="text-muted-foreground">None added</span>
                )}
              </Detail>
            </>
          )}
          <Detail label="Saved location">
            {user.location && position ? (
              <a
                href={getDirectionsUrl(user.location)}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK}
              >
                <MapPin aria-hidden="true" className="size-4" />
                {position.lat.toFixed(4)}°N, {position.lng.toFixed(4)}°E
                <span className="sr-only"> (opens a map in a new tab)</span>
              </a>
            ) : (
              <span className="text-muted-foreground">None saved</span>
            )}
          </Detail>
          <Detail label="Joined">{formatDateTime(user.createdAt)}</Detail>
        </dl>
      </section>

      <BlockAccountPanel user={user} />
    </div>
  )
}
