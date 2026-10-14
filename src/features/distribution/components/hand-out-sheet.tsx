'use client'

import { Radar, Tent } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { FormError } from '@/components/forms/form-error'
import { mapServerFieldErrors, setServerFieldError } from '@/components/forms/server-errors'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { MY_CAMPS_PARAMS } from '@/features/camp/camp.params'
import { useMyCampsQuery } from '@/features/camp/camp.queries'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage } from '@/lib/api/errors'
import { DISTRIBUTION_NOTES_MAX_LENGTH } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { AssignedCamp, FullTask } from '@/types'
import { useHandOut } from '../distribution.queries'
import { type HandOutInput, handOutSchema } from '../distribution.schema'

const FIELD_NAMES = ['taskId', 'campId', 'inventoryItemId', 'quantity', 'notes'] as const

type HandOutDefaults = {
  taskId?: string
  campId?: string
  inventoryItemId?: string
}

type HandOutFormProps = {
  camps: AssignedCamp[]
  tasks: FullTask[]
  defaults: HandOutDefaults
  onDone: () => void
}

function HandOutForm({ camps, tasks, defaults, onDone }: HandOutFormProps) {
  const handOut = useHandOut()
  const [serverError, setServerError] = useState<string | null>(null)

  // With one task, or one the page already chose, there is nothing to pick: say who it is for instead.
  const lockedTask = defaults.taskId
    ? tasks.find((task) => task.id === defaults.taskId)
    : tasks.length === 1
      ? tasks[0]
      : undefined

  const form = useAppForm({
    defaultValues: {
      taskId: lockedTask?.id ?? '',
      campId: defaults.campId ?? (camps.length === 1 ? (camps[0]?.id ?? '') : ''),
      inventoryItemId: defaults.inventoryItemId ?? '',
      quantity: '',
      notes: '',
    } as HandOutInput,
    validators: { onChange: handOutSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      const fields = handOutSchema.parse(value)
      const quantity = Number(fields.quantity)

      // The server checks the stock again and is the one that decides; this only saves a round trip
      // when the amount is plainly more than the camp holds.
      const item = camps
        .find((camp) => camp.id === fields.campId)
        ?.inventory.find((stock) => stock.id === fields.inventoryItemId)
      if (item && quantity > item.quantity) {
        setServerFieldError(
          formApi,
          'quantity',
          `Only ${item.quantity} ${item.unit} of ${item.itemName} is left in this camp.`,
        )
        return
      }

      try {
        await handOut.mutateAsync({
          taskId: fields.taskId,
          campId: fields.campId,
          inventoryItemId: fields.inventoryItemId,
          quantity,
          ...(fields.notes && { notes: fields.notes }),
        })
        onDone()
      } catch (error) {
        if (!mapServerFieldErrors(formApi, error, FIELD_NAMES)) {
          setServerError(getErrorMessage(error))
        }
      }
    },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-5 p-4"
    >
      {lockedTask ? (
        <p className="rounded-xl bg-muted p-3 text-sm">
          Handing out to <span className="font-semibold">{lockedTask.sosRequest.victim.name}</span>,
          the person you are helping.
        </p>
      ) : (
        <form.AppField name="taskId">
          {(field) => (
            <field.SelectField
              label="Who is it for?"
              placeholder="Choose the person you are helping"
              options={tasks.map((task) => ({
                value: task.id,
                label: `${task.sosRequest.victim.name}${task.sosRequest.address ? `, ${task.sosRequest.address}` : ''}`,
              }))}
            />
          )}
        </form.AppField>
      )}

      <form.AppField name="campId">
        {(field) => (
          <field.SelectField
            label="Camp"
            placeholder="Choose a camp"
            options={camps.map((camp) => ({ value: camp.id, label: camp.name }))}
            onValueChange={() => form.setFieldValue('inventoryItemId', '')}
          />
        )}
      </form.AppField>

      <form.Subscribe selector={(state) => state.values}>
        {(values) => {
          const camp = camps.find((candidate) => candidate.id === values.campId)
          const item = camp?.inventory.find((stock) => stock.id === values.inventoryItemId)
          return (
            <>
              <form.AppField name="inventoryItemId">
                {(field) => (
                  <field.SelectField
                    label="Item"
                    placeholder={camp ? 'Choose an item' : 'Choose a camp first'}
                    disabled={!camp}
                    options={(camp?.inventory ?? []).map((stock) => ({
                      value: stock.id,
                      label: `${stock.itemName} (${stock.quantity} ${stock.unit} left)`,
                    }))}
                    hint={
                      camp && camp.inventory.length === 0
                        ? 'This camp has nothing in stock right now.'
                        : undefined
                    }
                  />
                )}
              </form.AppField>

              <form.AppField name="quantity">
                {(field) => (
                  <field.TextField
                    label={item ? `Amount (${item.unit})` : 'Amount'}
                    inputMode="decimal"
                    placeholder="For example 2"
                    hint={item ? `Up to ${item.quantity} ${item.unit} in stock.` : undefined}
                  />
                )}
              </form.AppField>
            </>
          )
        }}
      </form.Subscribe>

      <form.AppField name="notes">
        {(field) => (
          <field.TextareaField
            label="Note"
            optional
            rows={3}
            maxLength={DISTRIBUTION_NOTES_MAX_LENGTH}
            placeholder="Anything worth writing down"
          />
        )}
      </form.AppField>

      <FormError message={serverError} />

      <form.AppForm>
        <form.SubmitButton>Hand out</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}

type HandOutSheetProps = HandOutDefaults & {
  open: boolean
  onOpenChange: (open: boolean) => void
  // The tasks the aid can go to: the ones being worked.
  tasks: FullTask[]
}

// Hands out one item from one of the volunteer's camps to the person they are helping. The recipient
// is always that task's victim (the server fixes it), and stock comes off in the same step. It loads
// the camps only while it is open, and says what is missing when there is nothing to hand out.
export function HandOutSheet({
  open,
  onOpenChange,
  tasks,
  taskId,
  campId,
  inventoryItemId,
}: HandOutSheetProps) {
  const camps = useMyCampsQuery(MY_CAMPS_PARAMS, { enabled: open })

  let body: React.ReactNode
  if (tasks.length === 0) {
    body = (
      <EmptyState
        bare
        icon={Radar}
        title="No one to hand out to"
        description="Aid goes to the person you are helping, so accept a request first."
        action={
          <Link
            href="/volunteer/nearby"
            className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-4')}
          >
            Find requests
          </Link>
        }
      />
    )
  } else if (camps.isPending) {
    body = (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
    )
  } else if (camps.isError) {
    body = <ListErrorState onRetry={() => camps.refetch()} />
  } else if (camps.data.items.length === 0) {
    body = (
      <EmptyState
        bare
        icon={Tent}
        title="You are not assigned to a camp"
        description="An NGO assigns volunteers to its relief camps. Once you are, the camp's stock appears here."
      />
    )
  } else {
    body = (
      <HandOutForm
        camps={camps.data.items}
        tasks={tasks}
        defaults={{ taskId, campId, inventoryItemId }}
        onDone={() => onOpenChange(false)}
      />
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Hand out aid</SheetTitle>
          <SheetDescription>
            Take an item from one of your camps and give it to the person you are helping. The
            camp's stock goes down and the hand-out is recorded.
          </SheetDescription>
        </SheetHeader>
        {body}
      </SheetContent>
    </Sheet>
  )
}
