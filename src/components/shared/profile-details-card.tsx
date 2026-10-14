'use client'

import { Pencil } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type ProfileFact = {
  label: string
  value: ReactNode
  // An email or another long unbroken string: it may break anywhere instead of overflowing.
  breakAnywhere?: boolean
  // A long text: it takes the whole row, and keeps its line breaks.
  wide?: boolean
}

type ProfileDetailsCardProps = {
  title: string
  description: string
  editTitle: string
  editDescription: string
  editLabel?: string
  facts: readonly ProfileFact[]
  // The form to show while editing. Call `done` after a save and on cancel to go back to reading.
  renderForm: (done: () => void) => ReactNode
}

// What a person sees first on a card: the details to read, not a form. The button under them turns the
// card into the form, and saving or cancelling turns it back. The form is mounted only while editing,
// so every edit starts from what is saved.
export function ProfileDetailsCard({
  title,
  description,
  editTitle,
  editDescription,
  editLabel = 'Edit profile',
  facts,
  renderForm,
}: ProfileDetailsCardProps) {
  const [editing, setEditing] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">{editing ? editTitle : title}</CardTitle>
        <CardDescription>{editing ? editDescription : description}</CardDescription>
      </CardHeader>
      <CardContent>
        {editing ? (
          renderForm(() => setEditing(false))
        ) : (
          <div className="flex flex-col gap-6">
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {facts.map(({ label, value, breakAnywhere, wide }) => (
                <div
                  key={label}
                  className={cn('flex min-w-0 flex-col gap-1', wide && 'sm:col-span-2')}
                >
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {label}
                  </dt>
                  <dd
                    className={cn(
                      breakAnywhere ? 'break-all' : 'break-words',
                      wide && 'whitespace-pre-line',
                    )}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="border-t pt-5">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-5"
                onClick={() => setEditing(true)}
              >
                <Pencil aria-hidden="true" />
                {editLabel}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
