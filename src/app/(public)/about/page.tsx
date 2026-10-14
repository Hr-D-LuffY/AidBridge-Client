import { Link2, ShieldAlert } from 'lucide-react'
import type { Metadata } from 'next'
import { AccountFlow } from '@/components/about/account-flow'
import { BentoCard } from '@/components/landing/bento-card'
import { Faq } from '@/components/landing/faq'
import { DISASTERS, SAFEGUARDS } from '@/components/landing/landing-content'
import { AskForHelpLink, VolunteerLink } from '@/components/landing/landing-cta-links'
import { SectionHeading } from '@/components/landing/section-heading'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { PageIntro } from '@/components/shared/page-intro'

const DESCRIPTION =
  'AidBridge coordinates emergency help: SOS requests, volunteers, relief camps and supplies in one place. Learn how it works, how accounts are created and how it protects people.'

export const metadata: Metadata = {
  title: 'About',
  description: DESCRIPTION,
  openGraph: { title: 'About | AidBridge', description: DESCRIPTION, type: 'website' },
}

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About AidBridge"
        title="One shared picture for the moment help is needed"
        description="In a disaster, help exists but is hard to match to need. AidBridge puts the people who need help, the volunteers nearby, the camps and the NGOs that supply them on the same record, so a request does not go unseen."
      />

      <section aria-labelledby="why-heading" className="page-container py-16">
        <SectionHeading
          id="why-heading"
          eyebrow="Why it exists"
          title="Scattered help is slow help"
          text="Requests arrive through calls and messages nobody can see together. Volunteers do not know where to go first. Camps do not know what is running short."
        />
        <Stagger className="mt-10 grid gap-4 md:grid-cols-3" gap={0.1}>
          {[
            {
              title: 'One record per request',
              text: 'Every request carries what is needed, where, and its progress, from the first message to the last delivery.',
            },
            {
              title: 'Everyone sees their part',
              text: 'The person in need, the volunteer, the NGO and the admin each see what they should, and nothing more.',
            },
            {
              title: 'Nothing is lost between hands',
              text: 'Claiming a request, taking stock out of a camp and closing a request are each done as one step that cannot be half done.',
            },
          ].map((item, index) => (
            <StaggerItem key={item.title}>
              <BentoCard featured={index === 0} className="h-full">
                <span className="text-4xl font-extrabold text-primary/40" aria-hidden="true">
                  0{index + 1}
                </span>
                <h3 className="mt-3 text-xl">{item.title}</h3>
                <p className="mt-2 text-sm text-pretty text-muted-foreground">{item.text}</p>
              </BentoCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section aria-labelledby="accounts-heading" className="border-y bg-card/50 py-16">
        <div className="page-container">
          <SectionHeading
            id="accounts-heading"
            eyebrow="Trust"
            title="How accounts are created"
            text="Trust matters when people share where they are. Each role comes into existence in one way only, and nobody can choose their own role."
          />
          <div className="mt-12">
            <AccountFlow />
          </div>
        </div>
      </section>

      <section aria-labelledby="safety-heading" className="page-container py-16">
        <SectionHeading
          id="safety-heading"
          eyebrow="Safety"
          title="How it protects people"
          text="These rules are enforced by the server, not just promised on a page."
        />
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2" gap={0.1}>
          {SAFEGUARDS.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title}>
              <BentoCard className="h-full">
                <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl">{title}</h3>
                <p className="mt-2 text-sm text-pretty text-muted-foreground">{text}</p>
              </BentoCard>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-4">
          <BentoCard className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-lg items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-info-soft text-info">
                <Link2 className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl">Requests belong to incidents</h3>
                <p className="mt-1 text-sm text-pretty text-muted-foreground">
                  Admins group requests under an incident, set its priority, and watch how many
                  people were rescued as it unfolds.
                </p>
              </div>
            </div>
            <ul className="flex flex-wrap gap-2">
              {DISASTERS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex h-10 items-center gap-2 rounded-full border bg-background px-3.5 text-sm font-semibold"
                >
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </BentoCard>
        </Reveal>
      </section>

      <section aria-labelledby="faq-heading" className="border-t bg-card/50 py-16">
        <div className="page-container">
          <SectionHeading
            id="faq-heading"
            eyebrow="Questions"
            title="Good to know before you start"
            align="center"
          />
          <Faq />
        </div>
      </section>

      <section className="page-container py-16">
        <div className="flex flex-col gap-5 rounded-3xl border border-warning/40 bg-warning-soft p-6 sm:flex-row sm:items-start sm:p-8">
          <ShieldAlert className="mt-0.5 size-7 shrink-0 text-warning" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <h2 className="text-xl">AidBridge does not replace the emergency services</h2>
            <p className="text-pretty">
              If you or someone near you is in immediate danger, call your local emergency number
              first. Use AidBridge to coordinate the help that comes after, and the help the
              emergency services cannot reach.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <AskForHelpLink />
          <VolunteerLink />
        </div>
      </section>
    </>
  )
}
