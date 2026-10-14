import Link from 'next/link'
import { BridgeBackdrop } from '@/components/motion/bridge-backdrop'
import { Reveal } from '@/components/motion/reveal'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// The last push: a red band with the logo's bridge drawing itself behind the words.
export function FinalCta() {
  return (
    <section className="page-container pb-20">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 sm:py-20">
          <BridgeBackdrop
            mono
            className="top-1/2 left-1/2 -z-10 w-[min(760px,150%)] -translate-x-1/2 -translate-y-1/2 text-primary-foreground/25"
          />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
            <h2 className="text-3xl text-balance sm:text-4xl">
              Someone near you may need help, or can give it.
            </h2>
            <p className="text-lg text-pretty">
              Create an account in a minute. You can ask for help straight away, and apply to
              volunteer from your dashboard.
            </p>
            <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/register"
                className={cn(
                  buttonVariants(),
                  'h-12 w-full rounded-xl bg-primary-foreground px-6 text-base font-bold text-primary hover:bg-primary-foreground/90 sm:w-auto',
                )}
              >
                Create an account
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-12 w-full rounded-xl border-primary-foreground/60 bg-transparent px-6 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:w-auto',
                )}
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
