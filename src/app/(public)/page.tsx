import type { Metadata } from 'next'
import Link from 'next/link'
import { EmergencySection } from '@/components/home/emergency-section'
import { FeatureBento } from '@/components/home/feature-bento'
import { GuidesGallery } from '@/components/home/guides-gallery'
import { HomeHero } from '@/components/home/home-hero'
import { NeedsOrbit } from '@/components/home/needs-orbit'
import { RolePanels } from '@/components/home/role-panels'
import { SafeguardList } from '@/components/home/safeguard-list'
import { StatsBand } from '@/components/home/stats-band'
import { Faq } from '@/components/landing/faq'
import { FinalCta } from '@/components/landing/final-cta'
import { JourneySection } from '@/components/landing/journey-section'
import { SectionHeading } from '@/components/landing/section-heading'

const TITLE = 'AidBridge | Disaster response and relief coordination'
const DESCRIPTION =
  'Ask for help, volunteer, and coordinate relief. AidBridge connects people in crisis with nearby volunteers, relief camps and the NGOs that supply them.'

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: 'AidBridge' },
}

// The home page: a hero with a slider and ten sections after it, each laid out differently on purpose
// (an inverted number band, a bento, the request journey, expanding role panels, an orbit with a
// ticker, a gallery, an editorial list, an alert panel with a timeline, a split FAQ and a closing
// band). Most are Server Components; the hero, the role panels, the guide dialog, the journey and the
// FAQ accordion need the browser. The older design is still at /classic.
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <StatsBand />
      <FeatureBento />

      <section
        id="how-it-works"
        aria-labelledby="journey-heading"
        className="scroll-mt-20 border-y bg-card/50 py-16 sm:py-20"
      >
        <div className="page-container">
          <SectionHeading
            id="journey-heading"
            eyebrow="How it works"
            title="Follow one request from first call to last delivery"
            text="Pick a stage, or just watch: a request moves from pending to closed while you see what the person in need, the volunteer and the admins experience."
          />
          <JourneySection />
        </div>
      </section>

      <RolePanels />
      <NeedsOrbit />
      <GuidesGallery />
      <SafeguardList />
      <EmergencySection />

      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="scroll-mt-20 border-t py-16 sm:py-20"
      >
        <div className="page-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              id="faq-heading"
              eyebrow="Questions"
              title="Good to know before you start"
              text="Short answers to what people ask first."
            />
            <p className="mt-6 text-sm text-muted-foreground">
              Something else?{' '}
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center font-semibold text-link hover:underline"
              >
                Send us a message
              </Link>
            </p>
          </div>
          <Faq className="" />
        </div>
      </section>

      <FinalCta />
    </>
  )
}
