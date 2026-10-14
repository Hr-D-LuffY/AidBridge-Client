// POST /tasks/:id/rate: the volunteer's new running average after a rating.
export type RateTaskResult = {
  taskId: string
  isRated: boolean
  volunteer: { id: string; reliabilityScore: number; totalRatings: number }
}
