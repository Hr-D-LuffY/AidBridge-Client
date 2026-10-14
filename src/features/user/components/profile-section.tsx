import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ProfileSectionProps = {
  title: string
  description?: string
  // A red frame for the part that cannot be undone.
  danger?: boolean
  children: ReactNode
}

// One card of the profile page: a heading, a line of help and the controls.
export function ProfileSection({
  title,
  description,
  danger = false,
  children,
}: ProfileSectionProps) {
  return (
    <Card className={cn(danger && 'ring-destructive/40')}>
      <CardHeader>
        <CardTitle className="font-heading text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-5">{children}</CardContent>
    </Card>
  )
}
