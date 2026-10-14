'use client'

import { MessageSquare, SendHorizontal, TriangleAlert } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppForm } from '@/hooks/use-app-form'
import { usePolling } from '@/hooks/use-polling'
import { useSession } from '@/hooks/use-session'
import { getErrorMessage } from '@/lib/api/errors'
import {
  CHAT_MESSAGE_MAX_LENGTH,
  CHAT_PAGE_SIZE,
  POLL_INTERVAL_MS,
  ROLE_LABEL,
} from '@/lib/constants'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types'
import { useMessagesQuery, useSendMessage } from '../message.queries'
import { type SendMessageInput, sendMessageSchema } from '../message.schema'

type ChatPanelProps = {
  sosId: string
  // True while the conversation is live (a volunteer holds an open request): turns polling on and
  // lets a participant write.
  live: boolean
  // Admins read a conversation but never post in it.
  readOnly?: boolean
  // Why nobody can write right now ("Chat opens when a volunteer takes your request."). Shown in
  // place of the composer.
  closedNote?: string
}

function Bubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  return (
    <li className={cn('flex flex-col gap-1', mine ? 'items-end' : 'items-start')}>
      <p className="px-1 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{mine ? 'You' : message.sender.name}</span>
        {!mine && <> · {ROLE_LABEL[message.sender.role]}</>}
        {' · '}
        <time dateTime={message.createdAt}>{formatRelativeTime(message.createdAt)}</time>
      </p>
      <p
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-wrap',
          mine ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'bg-muted text-foreground',
        )}
      >
        {message.content}
      </p>
    </li>
  )
}

function Composer({ sosId }: { sosId: string }) {
  const send = useSendMessage(sosId)
  const form = useAppForm({
    defaultValues: { content: '' } as SendMessageInput,
    validators: { onSubmit: sendMessageSchema },
    onSubmit: async ({ value, formApi }) => {
      const { content } = sendMessageSchema.parse(value)
      try {
        await send.mutateAsync(content)
        formApi.reset()
      } catch {
        // The error shows under the box (send.error); the text stays so it can be sent again.
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
      className="flex flex-col gap-2"
    >
      <form.Field name="content">
        {(field) => (
          <div className="flex items-end gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <label htmlFor={`chat-${sosId}`} className="sr-only">
                Your message
              </label>
              <textarea
                id={`chat-${sosId}`}
                value={field.state.value}
                rows={2}
                maxLength={CHAT_MESSAGE_MAX_LENGTH}
                placeholder="Write a message"
                onChange={(event) => field.handleChange(event.target.value)}
                onKeyDown={(event) => {
                  // Enter sends, Shift+Enter starts a new line.
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault()
                    form.handleSubmit()
                  }
                }}
                className="min-h-12 w-full resize-none rounded-xl border border-input bg-transparent px-3 py-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
              />
              <p className="px-1 text-xs text-muted-foreground tabular-nums">
                {field.state.value.length} / {CHAT_MESSAGE_MAX_LENGTH}. Enter sends, Shift+Enter
                adds a line.
              </p>
            </div>
            <Button
              type="submit"
              className="size-12 shrink-0 rounded-xl"
              disabled={send.isPending || field.state.value.trim() === ''}
            >
              <SendHorizontal aria-hidden="true" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        )}
      </form.Field>
      {send.isError && (
        <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {getErrorMessage(send.error)}
        </p>
      )}
    </form>
  )
}

// The conversation between a victim and the volunteer on their request. It looks for new messages
// every few seconds while it is live (the backend has no websockets), shows the latest 100, oldest at
// the top, and stays readable after the request ends. No animation on purpose: it is read under stress.
export function ChatPanel({ sosId, live, readOnly = false, closedNote }: ChatPanelProps) {
  const session = useSession()
  const poll = usePolling(POLL_INTERVAL_MS.chat, live)
  const { data, isPending, isError, refetch } = useMessagesQuery(sosId, poll)

  const scroller = useRef<HTMLDivElement>(null)
  const stickToEnd = useRef(true)
  const count = data?.items.length ?? 0

  // New messages scroll into view, unless the reader has scrolled up to read older ones.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `count` is the trigger on purpose.
  useEffect(() => {
    const element = scroller.current
    if (element && stickToEnd.current) element.scrollTop = element.scrollHeight
  }, [count])

  // Newest first from the backend, oldest first on screen.
  const messages = data ? [...data.items].reverse() : []
  const canWrite = live && !readOnly

  return (
    <section
      aria-labelledby={`chat-title-${sosId}`}
      className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:p-5"
    >
      <h2 id={`chat-title-${sosId}`} className="text-base font-semibold">
        Messages
      </h2>

      {isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-2/3 rounded-2xl" />
          <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
        </div>
      ) : isError && !data ? (
        <div className="flex flex-col items-start gap-2 text-sm">
          <p className="flex items-start gap-2 text-destructive">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            The messages could not be loaded.
          </p>
          <Button type="button" variant="outline" className="h-10 px-4" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          bare
          icon={MessageSquare}
          title="No messages yet"
          description={
            canWrite
              ? 'Say hello, or tell the volunteer anything that will help them reach you.'
              : (closedNote ?? 'Nothing was written on this request.')
          }
          className="py-6"
        />
      ) : (
        <>
          {data && data.meta.total > CHAT_PAGE_SIZE && (
            <p className="text-xs text-muted-foreground">
              Showing the latest {CHAT_PAGE_SIZE} of {data.meta.total} messages.
            </p>
          )}
          {/* A scrollable region must be reachable by keyboard, so a keyboard user can read the
              history. It is a log that announces additions politely. */}
          <div
            ref={scroller}
            onScroll={(event) => {
              const element = event.currentTarget
              stickToEnd.current =
                element.scrollHeight - element.scrollTop - element.clientHeight < 48
            }}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be focusable.
            tabIndex={0}
            role="log"
            aria-label="Conversation"
            aria-live="polite"
            aria-relevant="additions"
            className="max-h-96 overflow-y-auto rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ul className="flex flex-col gap-3 py-1">
              {messages.map((message) => (
                <Bubble
                  key={message.id}
                  message={message}
                  mine={message.sender.id === session.id}
                />
              ))}
            </ul>
          </div>
        </>
      )}

      {canWrite ? (
        <Composer sosId={sosId} />
      ) : (
        messages.length > 0 &&
        (closedNote || readOnly) && (
          <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
            {readOnly ? 'You can read this conversation but not write in it.' : closedNote}
          </p>
        )
      )}
    </section>
  )
}
