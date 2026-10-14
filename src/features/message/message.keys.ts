// One key factory for the chat queries. Plain module, like sos.keys.ts.
export const messageKeys = {
  all: ['messages'] as const,
  list: (sosId: string) => [...messageKeys.all, 'list', sosId] as const,
}
