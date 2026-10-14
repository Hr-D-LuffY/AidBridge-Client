import { type LucideIcon, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ErrorScreenProps = {
  icon?: LucideIcon
  title: string
  children: ReactNode
  // Buttons under the text: "Try again", a link home. The caller decides.
  actions: ReactNode
}

// Centred message used by the 404 page and the error boundaries. It never leaves a blank screen.
export function ErrorScreen({
  icon: Icon = TriangleAlert,
  title,
  children,
  actions,
}: ErrorScreenProps) {
  return (
    <div className="page-container flex min-h-[60dvh] flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h1 className="text-3xl">{title}</h1>
      <div className="max-w-md text-muted-foreground">{children}</div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">{actions}</div>
    </div>
  )
}

export function HomeLink({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-5', className)}>
      Back to home
    </Link>
  )
}
