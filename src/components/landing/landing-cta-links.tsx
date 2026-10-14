import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// The two doors into the product, used by every landing design. Real links styled as buttons (not
// <Button render={<Link />}>, which would give the anchor role="button").
const BASE = 'h-12 rounded-xl px-5 text-base font-semibold'

export function AskForHelpLink({ className }: { className?: string }) {
  return (
    <Link
      href="/register"
      className={cn(
        buttonVariants(),
        BASE,
        'bg-cta text-cta-foreground hover:bg-cta/90',
        className,
      )}
    >
      Ask for help
      <ArrowRight aria-hidden="true" />
    </Link>
  )
}

export function VolunteerLink({ className }: { className?: string }) {
  return (
    <Link href="/register" className={cn(buttonVariants({ variant: 'outline' }), BASE, className)}>
      Become a volunteer
    </Link>
  )
}
