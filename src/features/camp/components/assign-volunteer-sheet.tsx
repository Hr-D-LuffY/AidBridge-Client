'use client'

import { UserRoundX } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { FormError } from '@/components/forms/form-error'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useVolunteersQuery } from '@/features/user/user.queries'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage } from '@/lib/api/errors'
import type { ManagedCamp, VolunteerContact } from '@/types'
import { useAssignVolunteer } from '../camp.queries'

const assignSchema = z.object({ volunteerId: z.string().min(1, 'Choose a volunteer') })

// "Aisha Rahman, 01711 000000" (the phone, else the email: an NGO needs one way to reach them).
function describeVolunteer(volunteer: VolunteerContact) {
  const contact = volunteer.phone || volunteer.email
  const away = volunteer.isAvailable ? '' : ' (not available)'
  return `${volunteer.name}${away}, ${contact}`
}

function AssignForm({ camp, onDone }: { camp: ManagedCamp; onDone: () => void }) {
  const volunteers = useVolunteersQuery()
  const assign = useAssignVolunteer(camp.id)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { volunteerId: '' },
    validators: { onChange: assignSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      try {
        await assign.mutateAsync(value.volunteerId)
        onDone()
      } catch (error) {
        if (!mapServerFieldErrors(formApi, error, ['volunteerId'])) {
          setServerError(getErrorMessage(error))
        }
      }
    },
  })

  if (volunteers.isPending) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
    )
  }
  if (volunteers.isError) return <ListErrorState onRetry={() => volunteers.refetch()} />

  // Someone already on the camp is not offered again.
  const onCamp = new Set(camp.assignedVolunteers.map((volunteer) => volunteer.id))
  const choices = volunteers.data.items.filter((volunteer) => !onCamp.has(volunteer.id))

  if (choices.length === 0) {
    return (
      <EmptyState
        bare
        icon={UserRoundX}
        title="No one left to assign"
        description={
          volunteers.data.items.length === 0
            ? 'There are no volunteers yet. An admin approves volunteers, and they show up here.'
            : 'Every volunteer is already on this camp.'
        }
      />
    )
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-5 p-4"
    >
      <form.AppField name="volunteerId">
        {(field) => (
          <field.SelectField
            label="Volunteer"
            placeholder="Choose a volunteer"
            options={choices.map((volunteer) => ({
              value: volunteer.id,
              label: describeVolunteer(volunteer),
            }))}
            hint={
              volunteers.data.meta.total > volunteers.data.items.length
                ? `Showing the first ${volunteers.data.items.length} of ${volunteers.data.meta.total} volunteers.`
                : undefined
            }
          />
        )}
      </form.AppField>

      <FormError message={serverError} />

      <form.AppForm>
        <form.SubmitButton>Assign to camp</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}

type AssignVolunteerSheetProps = {
  camp: ManagedCamp
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Puts a volunteer on a camp's team. Assigned volunteers see the camp and its stock and can hand it out
// to the people they are helping. Mount it only while it is open: it reads the volunteers then.
export function AssignVolunteerSheet({ camp, open, onOpenChange }: AssignVolunteerSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Assign a volunteer</SheetTitle>
          <SheetDescription>
            Choose who works at {camp.name}. They can then hand out its stock.
          </SheetDescription>
        </SheetHeader>
        <AssignForm camp={camp} onDone={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}
