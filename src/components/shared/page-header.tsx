import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageHeaderProps = {
  // The page's one <h1>.
  title: string
  description?: string
  // Buttons on the right (on their own line on a phone): "Raise SOS", "Add camp".
  actions?: ReactNode
  // A detail page's way back to its list.
  back?: { href: string; label: string }
  className?: string
}

// The top of every signed-in page: optional back link, title, one line of help and the page's main
// actions. Plain markup with no hooks, so Server and Client Components can both render it.
export function PageHeader({ title, description, actions, back, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-3', className)}>
      {back && (
        <Link
          href={back.href}
          className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:min-h-11"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-2xl text-balance sm:text-3xl">{title}</h1>
          {description && (
            <p className="max-w-2xl text-pretty text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
