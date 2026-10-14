import type { ReactNode } from 'react'
import { UserAvatar } from '@/components/shared/user-avatar'

type ProfileIdentityCardProps = {
  name: string
  email: string
  // Pills under the email: the role, a rating.
  badges?: ReactNode
}

// Who the person is, at a glance: a large avatar on a soft gradient band, then their name, email and a
// few badges. Accounts have no photo, so it shows their initials. Plain markup with no hooks of its own.
export function ProfileIdentityCard({ name, email, badges }: ProfileIdentityCardProps) {
  return (
    <section
      aria-label="Profile summary"
      className="overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10"
    >
      <div
        aria-hidden="true"
        className="h-24 bg-linear-to-br from-primary/40 via-info-soft to-card"
      />
      <div className="flex flex-col items-center gap-4 px-5 pb-6 text-center">
        <div className="-mt-[5.125rem] rounded-full bg-card p-1.5 shadow-card ring-1 ring-foreground/10">
          <UserAvatar name={name} size={152} />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="font-heading text-2xl break-words">{name}</h2>
          <p className="text-sm break-all text-muted-foreground">{email}</p>
        </div>
        {badges && <div className="flex flex-wrap items-center justify-center gap-2">{badges}</div>}
      </div>
    </section>
  )
}
