import type { Metadata } from 'next'
import { FinalCta } from '@/components/landing/final-cta'
import { Hero } from '@/components/landing/hero'
import { Highlights } from '@/components/landing/highlights'
import { JourneySection } from '@/components/landing/journey-section'
import { RolesBento } from '@/components/landing/roles-bento'
import { SectionHeading } from '@/components/landing/section-heading'

const TITLE = 'AidBridge | Disaster response and relief coordination'
const DESCRIPTION =
  'Ask for help, volunteer, and coordinate relief. AidBridge connects people in crisis with nearby volunteers, relief camps and the NGOs that supply them.'

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: 'AidBridge' },
}

// The landing page: five parts. The sections are Server Components; only the animated leaves (the
// radar, the bento drawings, the request journey and the scroll reveals) ship JavaScript.
export default function HomePage() {
  return (
    <>
      <Hero />
      <Highlights />

      <section aria-labelledby="journey-heading" className="border-y bg-card/50 py-20">
        <div className="page-container">
          <SectionHeading
            id="journey-heading"
            eyebrow="Follow a request"
            title="What each person sees, at every stage"
            text="Pick a stage, or just watch: one request moves from pending to closed while you see what the person in need, the volunteer and the admins experience."
          />
          <JourneySection />
        </div>
      </section>

      <section aria-labelledby="roles-heading" className="page-container py-20">
        <SectionHeading
          id="roles-heading"
          eyebrow="Who it is for"
          title="Four roles, one shared picture"
          text="People sign up to ask for help, and can apply to volunteer. NGO and admin accounts are created by an admin."
        />
        <RolesBento />
      </section>

      <FinalCta />
    </>
  )
}
