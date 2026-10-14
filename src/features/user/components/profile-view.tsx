'use client'

import { PageHeader } from '@/components/shared/page-header'
import { ProfileDetailsCard, type ProfileFact } from '@/components/shared/profile-details-card'
import { ProfileIdentityCard } from '@/components/shared/profile-identity-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { useSession } from '@/hooks/use-session'
import { formatDate } from '@/lib/format'
import { Role } from '@/types'
import { ChangePasswordForm } from './change-password-form'
import { DeleteAccount } from './delete-account'
import { DetailsForm } from './details-form'
import { ProfileSection } from './profile-section'
import { VolunteerSettings } from './volunteer-settings'

// The same page for all four roles under their own area (/dashboard/profile, /volunteer/profile, ...),
// laid out like CareNest's: who you are on the left, your details to read first (and edit on request)
// on the right, then the password and closing the account. The profile is the live one the area
// layout read from GET /auth/me; after a save the layout is refreshed.
export function ProfileView() {
  const profile = useSession()

  const facts: ProfileFact[] = [
    { label: 'Full name', value: profile.name },
    { label: 'Email', value: profile.email, breakAnywhere: true },
    {
      label: 'Phone',
      value: profile.phone ?? <span className="text-muted-foreground">No phone saved yet.</span>,
    },
    { label: 'Member since', value: formatDate(profile.createdAt) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profile"
        description="Your details, password and account. Keep your phone up to date so people can reach you."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <ProfileIdentityCard
          name={profile.name}
          email={profile.email}
          badges={<StatusBadge kind="role" status={profile.role} />}
        />

        <div className="flex min-w-0 flex-col gap-6">
          <ProfileDetailsCard
            title="Your details"
            description="Your email and role cannot be changed here."
            editTitle="Edit your details"
            editDescription="Change your name or phone."
            facts={facts}
            renderForm={(done) => <DetailsForm profile={profile} onDone={done} />}
          />

          {profile.role === Role.VOLUNTEER && <VolunteerSettings profile={profile} />}

          <ProfileDetailsCard
            title="Password"
            description="After you change it, every other device is signed out."
            editTitle="Change your password"
            editDescription="Enter your current password, then choose a new one."
            editLabel="Change password"
            facts={[{ label: 'Password', value: '••••••••' }]}
            renderForm={(done) => <ChangePasswordForm onDone={done} />}
          />

          <ProfileSection
            title="Delete account"
            description="Your account is closed and you can no longer log in. This is refused while a request you are part of is still open."
            danger
          >
            <DeleteAccount />
          </ProfileSection>
        </div>
      </div>
    </div>
  )
}
