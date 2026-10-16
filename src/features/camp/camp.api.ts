import { clientApi } from '@/lib/api/client'
import type {
  AssignedCamp,
  CampListParams,
  CreateCampPayload,
  ManagedCamp,
  MyCampsParams,
  NearbyCamp,
  NearbyCampParams,
  UpdateCampPayload,
} from '@/types'

export const campApi = {
  // Active camps around a point, nearest first (victims and admins only).
  nearby: (params: NearbyCampParams, signal?: AbortSignal) =>
    clientApi.getList<NearbyCamp>('/camps/nearby', params, signal),
  // The active camps the volunteer is assigned to, each with the items in stock there.
  mine: (params: MyCampsParams, signal?: AbortSignal) =>
    clientApi.getList<AssignedCamp>('/camps/my-assigned', params, signal),

  // Camps an NGO runs (an admin gets every NGO's), active first.
  list: (params: CampListParams, signal?: AbortSignal) =>
    clientApi.getList<ManagedCamp>('/camps', params, signal),
  create: (payload: CreateCampPayload) => clientApi.post<ManagedCamp>('/camps', payload),
  // Only what changed. A capacity below the people already there is a 409.
  update: (id: string, payload: UpdateCampPayload) =>
    clientApi.put<ManagedCamp>(`/camps/${id}`, payload),
  // Soft delete: the camp's stock is kept and goes back to the NGO's general store.
  remove: (id: string) => clientApi.delete(`/camps/${id}`),
  assign: (id: string, volunteerId: string) =>
    clientApi.put<ManagedCamp>(`/camps/${id}/assign`, { volunteerId }),
  unassign: (id: string, volunteerId: string) =>
    clientApi.put<ManagedCamp>(`/camps/${id}/unassign`, { volunteerId }),
  // Check people in (positive) or out (negative). Over capacity or below zero is a 409.
  changeOccupancy: (id: string, delta: number) =>
    clientApi.put<ManagedCamp>(`/camps/${id}/occupancy`, { delta }),
}
