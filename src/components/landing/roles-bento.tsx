import { Check } from 'lucide-react'
import Link from 'next/link'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BentoCard } from './bento-card'
import { ROLE_DETAILS, type RoleDetail } from './landing-content'

const TONES: Record<RoleDetail['id'], string> = {
  victim: 'bg-accent text-accent-foreground',
  volunteer: 'bg-info-soft text-info',
  ngo: 'bg-success-soft text-success',
  admin: 'bg-warning-soft text-warning',
}

const SPANS: Record<RoleDetail['id'], string> = {
  victim: 'lg:col-span-2',
  volunteer: '',
  ngo: '',
  admin: 'lg:col-span-2',
}

function RoleCard({ role }: { role: RoleDetail }) {
  const Icon = role.icon
  const wide = role.id === 'victim' || role.id === 'admin'
  return (
    <BentoCard featured={wide} className="flex flex-col justify-between gap-6">
      <div>
        <span className={cn('grid size-12 place-items-center rounded-2xl', TONES[role.id])}>
          <Icon aria-hidden="true" className="size-6" />
        </span>
        <h3 className="mt-5 text-2xl">{role.title}</h3>
        <p className="mt-1 text-pretty text-muted-foreground">{role.summary}</p>
        <ul className={cn('mt-5 grid gap-3 text-sm', wide && 'sm:grid-cols-2')}>
          {role.capabilities.slice(0, 4).map((capability) => (
            <li key={capability} className="flex items-start gap-2.5">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
              <span className="text-pretty">{capability}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">How you join: </span>
          {role.join}
        </p>
        {role.id === 'victim' && (
          <Link
            href="/register"
            className={cn(
              buttonVariants(),
              'h-11 shrink-0 rounded-xl bg-cta px-5 font-semibold text-cta-foreground hover:bg-cta/90',
            )}
          >
            Create an account
          </Link>
        )}
      </div>
    </BentoCard>
  )
}

// The four roles as a bento grid: the two that people sign up for or apply to get a wide card, the two
// that an admin creates sit beside them. Reads as a map of who does what.
export function RolesBento() {
  return (
    <Stagger className="mt-12 grid gap-4 lg:grid-cols-3" gap={0.1}>
      {ROLE_DETAILS.map((role) => (
        <StaggerItem key={role.id} className={SPANS[role.id]}>
          <RoleCard role={role} />
        </StaggerItem>
      ))}
    </Stagger>
  )
}
