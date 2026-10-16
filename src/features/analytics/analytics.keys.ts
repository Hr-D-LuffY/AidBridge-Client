// One key factory for every analytics query. Plain module: the server pages import it too.
export const analyticsKeys = {
  all: ['analytics'] as const,
  // What is open right now (requests and camps), for the live map.
  liveMap: () => [...analyticsKeys.all, 'live-map'] as const,
}
