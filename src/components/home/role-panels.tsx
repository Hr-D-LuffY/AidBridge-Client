'use client'

import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { ROLE_DETAILS, type RoleDetail } from '@/components/landing/landing-content'
import { SectionHeading } from '@/components/landing/section-heading'
import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'
import { ROLE_CARD_POINTS } from './home-content'

// One colour treatment per role, so the four panels look like four different things.
const TONES: Record<RoleDetail['id'], string> = {
  victim: 'bg-primary text-primary-foreground border-primary',
  volunteer: 'bg-foreground text-background border-foreground',
  ngo: 'bg-accent text-accent-foreground',
  admin: 'bg-card',
}

// The four roles as panels that open like an accordion: side by side on a desktop (the open one is wide,
// the others are narrow strips with a vertical title), stacked on a phone. The first role is open, a
// click or key press opens another, and every header is a real button.
export function RolePanels() {
  const [open, setOpen] = useState(0)

  return (
    <section
      id="roles"
      aria-labelledby="roles-heading"
      className="page-container scroll-mt-20 py-16 sm:py-20"
    >
      <SectionHeading
        id="roles-heading"
        eyebrow="Who it is for"
        title="Four roles, one shared picture"
        text="People sign up to ask for help and can apply to volunteer. NGO and admin accounts are created by an admin."
      />

      <Reveal className="mt-10 flex flex-col gap-3 lg:h-[28rem] lg:flex-row">
        {ROLE_DETAILS.map((role, index) => {
          const Icon = role.icon
          const active = index === open
          const panelId = `role-panel-${role.id}`
          return (
            <section
              key={role.id}
              className={cn(
                'relative flex min-w-0 flex-col overflow-hidden rounded-3xl border transition-[flex-grow] duration-500 motion-reduce:transition-none',
                TONES[role.id],
                active ? 'lg:flex-[3.2]' : 'lg:flex-[0.7]',
              )}
            >
              <h3 className="text-base">
                <button
                  type="button"
                  aria-expanded={active}
                  aria-controls={panelId}
                  onClick={() => setOpen(index)}
                  className={cn(
                    'flex w-full items-center gap-3 p-5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:flex-col lg:items-start',
                    !active && 'lg:h-full lg:justify-between',
                  )}
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-current/15">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <span
                    className={cn(
                      'text-xl font-bold',
                      !active && 'lg:rotate-180 lg:text-2xl lg:[writing-mode:vertical-rl]',
                    )}
                  >
                    {role.title}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      'ml-auto size-5 shrink-0 transition-transform lg:hidden',
                      active && 'rotate-180',
                    )}
                  />
                </button>
              </h3>

              <div
                id={panelId}
                className={cn(
                  'grid transition-[grid-template-rows] duration-500 motion-reduce:transition-none',
                  active ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
              >
                <div className="overflow-hidden" inert={!active}>
                  <div className="flex flex-col gap-4 px-5 pb-5 lg:min-w-80">
                    <p className="text-pretty opacity-90">{role.summary}</p>
                    <ul className="flex flex-col gap-2.5 text-sm">
                      {role.capabilities.slice(0, ROLE_CARD_POINTS).map((point) => (
                        <li key={point} className="flex items-start gap-2.5">
                          <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                          <span className="text-pretty">{point}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="border-t border-current/20 pt-3 text-sm text-pretty opacity-90">
                      <span className="font-bold">How to join: </span>
                      {role.join}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </Reveal>
    </section>
  )
}
