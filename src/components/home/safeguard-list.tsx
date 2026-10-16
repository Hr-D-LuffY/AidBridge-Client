import { SAFEGUARDS } from '@/components/landing/landing-content'
import { SectionHeading } from '@/components/landing/section-heading'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'

// How the platform protects people, as an editorial list: a heading that stays in view on the left and
// four numbered rules on the right, separated by lines instead of boxes. Each rule is enforced by the
// server, not just promised on a page.
export function SafeguardList() {
  return (
    <section
      id="safety"
      aria-labelledby="safety-heading"
      className="scroll-mt-20 border-y bg-card/50 py-16 sm:py-20"
    >
      <div className="page-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="safety-heading"
            eyebrow="Safety and trust"
            title="How it protects the people who use it"
            text="These are rules in the code, not promises on a page."
          />
          <Reveal delay={0.15}>
            <p className="mt-6 text-8xl leading-none font-extrabold tracking-tighter text-primary/15 max-lg:hidden">
              4
            </p>
            <p className="text-sm font-semibold text-muted-foreground max-lg:hidden">
              rules, checked on every request
            </p>
          </Reveal>
        </div>

        <Stagger className="flex flex-col" gap={0.1}>
          {SAFEGUARDS.map(({ icon: Icon, title, text }, index) => (
            <StaggerItem key={title}>
              <div className="group grid grid-cols-[3rem_1fr] gap-4 border-t py-7 first:border-t-0 first:pt-0 sm:grid-cols-[4.5rem_1fr] sm:gap-6">
                <p
                  aria-hidden="true"
                  className="text-3xl font-extrabold text-muted-foreground/50 transition-colors group-hover:text-primary sm:text-4xl"
                >
                  {String(index + 1).padStart(2, '0')}
                </p>
                <div>
                  <h3 className="flex items-center gap-2.5 text-xl">
                    <Icon aria-hidden="true" className="size-5 text-primary" />
                    {title}
                  </h3>
                  <p className="mt-2 max-w-xl text-pretty text-muted-foreground">{text}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
