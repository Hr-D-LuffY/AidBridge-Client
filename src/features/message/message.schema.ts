import { z } from 'zod'
import { CHAT_MESSAGE_MAX_LENGTH } from '@/lib/constants'

// Mirrors the backend (message.interface.ts): trimmed, 1 to 500 characters.
export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Write a message first')
    .max(
      CHAT_MESSAGE_MAX_LENGTH,
      `A message can have at most ${CHAT_MESSAGE_MAX_LENGTH} characters`,
    ),
})

export type SendMessageInput = z.input<typeof sendMessageSchema>
