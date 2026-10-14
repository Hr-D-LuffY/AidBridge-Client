import type { Role } from './enums'

// One chat message on an SOS request (GET /sos/:sosId/messages). The list comes newest first.
export type ChatMessage = {
  id: string
  sosRequest: string
  sender: { id: string; name: string; role: Role }
  content: string
  createdAt: string
}
