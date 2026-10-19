import { z } from 'zod'
import type { DispatchLimits, DispatchSettings, UpdateDispatchSettingsPayload } from '@/types'

// The settings form. Every box is text (so a half-typed number is not lost) and is checked against the
// bounds the backend sends with the settings. The five weights are entered as percent boxes that must
// total 100; the backend wants them as 0-1 numbers that total 1.

export type FieldName =
  | 'waitCritical'
  | 'waitHigh'
  | 'waitMedium'
  | 'waitLow'
  | 'volunteersPerRound'
  | 'offerWindowMinutes'
  | 'criticalOfferWindowMinutes'
  | 'startRadiusKm'
  | 'radiusFactor'
  | 'maxRadiusKm'
  | 'maxRounds'
  | 'retryIntervalMinutes'
  | 'setOffWithinMinutes'
  | 'criticalSetOffWithinMinutes'
  | 'wDistance'
  | 'wReliability'
  | 'wLoad'
  | 'wSkillMatch'
  | 'wNoShow'

export type SettingsFormValues = Record<FieldName, string>

type Range = { min: number; max: number }

type FieldSpec = {
  name: FieldName
  label: string
  unit: string
  // Where the bounds come from in `limits`.
  limit: Exclude<keyof DispatchLimits, 'weight'> | 'weight'
  whole: boolean
  // What the backend calls the field, for its error messages.
  path: string
  // The saved value as the box shows it.
  read: (settings: DispatchSettings) => number
  // Puts the box's value into the update payload in the backend's units.
  write: (changes: UpdateDispatchSettingsPayload, value: number) => void
}

// Whole percent to one decimal, so 0.4 shows as 40 and not 40.00000000000001.
const toPercent = (weight: number) => Math.round(weight * 1000) / 10
const fromPercent = (percent: number) => Number((percent / 100).toFixed(3))

const wait = (
  name: FieldName,
  key: 'critical' | 'high' | 'medium' | 'low',
  label: string,
): FieldSpec => ({
  name,
  label,
  unit: 'minutes',
  limit: 'waitMinutes',
  whole: true,
  path: `waitMinutes.${key}`,
  read: (s) => s.waitMinutes[key],
  write: (c, v) => {
    c.waitMinutes = { ...c.waitMinutes, [key]: v }
  },
})

const plain = (
  name: Exclude<
    FieldName,
    | 'waitCritical'
    | 'waitHigh'
    | 'waitMedium'
    | 'waitLow'
    | 'wDistance'
    | 'wReliability'
    | 'wLoad'
    | 'wSkillMatch'
    | 'wNoShow'
  >,
  label: string,
  unit: string,
  limit: FieldSpec['limit'],
  whole = true,
): FieldSpec => ({
  name,
  label,
  unit,
  limit,
  whole,
  path: name,
  read: (s) => s[name],
  write: (c, v) => {
    c[name] = v
  },
})

const weight = (
  name: FieldName,
  key: keyof DispatchSettings['weights'],
  label: string,
): FieldSpec => ({
  name,
  label,
  unit: '%',
  limit: 'weight',
  whole: false,
  path: `weights.${key}`,
  read: (s) => toPercent(s.weights[key]),
  write: (c, v) => {
    c.weights = { ...c.weights, [key]: fromPercent(v) }
  },
})

export const WAIT_FIELDS = [
  wait('waitCritical', 'critical', 'Critical requests'),
  wait('waitHigh', 'high', 'High priority'),
  wait('waitMedium', 'medium', 'Medium priority'),
  wait('waitLow', 'low', 'Low priority'),
]

export const OFFER_FIELDS = [
  plain('volunteersPerRound', 'Volunteers asked in each round', 'people', 'volunteersPerRound'),
  plain('offerWindowMinutes', 'Time to answer an offer', 'minutes', 'offerWindowMinutes'),
  plain(
    'criticalOfferWindowMinutes',
    'Time to answer a critical offer',
    'minutes',
    'offerWindowMinutes',
  ),
]

export const SEARCH_FIELDS = [
  plain('startRadiusKm', 'First search distance', 'km', 'radiusKm'),
  plain('radiusFactor', 'Widen the search by', 'times', 'radiusFactor', false),
  plain('maxRadiusKm', 'Widest search distance', 'km', 'radiusKm'),
  plain('maxRounds', 'Rounds before "no volunteer found"', 'rounds', 'maxRounds'),
  plain('retryIntervalMinutes', 'Try again every, after that', 'minutes', 'retryIntervalMinutes'),
]

export const SET_OFF_FIELDS = [
  plain('setOffWithinMinutes', 'Time to set off', 'minutes', 'setOffWithinMinutes'),
  plain(
    'criticalSetOffWithinMinutes',
    'Time to set off, critical requests',
    'minutes',
    'setOffWithinMinutes',
  ),
]

export const WEIGHT_FIELDS = [
  weight('wDistance', 'distance', 'Distance (closer is better)'),
  weight('wReliability', 'reliability', 'Reliability (past ratings)'),
  weight('wLoad', 'load', 'Free capacity (fewer active tasks)'),
  weight('wSkillMatch', 'skillMatch', 'Skills the request wants'),
  weight('wNoShow', 'noShowPenalty', 'No-show penalty'),
]

const ALL_FIELDS: readonly FieldSpec[] = [
  ...WAIT_FIELDS,
  ...OFFER_FIELDS,
  ...SEARCH_FIELDS,
  ...SET_OFF_FIELDS,
  ...WEIGHT_FIELDS,
]

// The bounds as the box shows them (the weights in percent).
export function getRange(spec: Pick<FieldSpec, 'limit'>, limits: DispatchLimits): Range {
  const { min, max } = limits[spec.limit]
  return spec.limit === 'weight' ? { min: min * 100, max: max * 100 } : { min, max }
}

export function toFormValues(settings: DispatchSettings): SettingsFormValues {
  return Object.fromEntries(
    ALL_FIELDS.map((spec) => [spec.name, String(spec.read(settings))]),
  ) as SettingsFormValues
}

function numberField(spec: FieldSpec, limits: DispatchLimits) {
  const { min, max } = getRange(spec, limits)
  return z
    .string()
    .trim()
    .min(1, 'Enter a number')
    .superRefine((text, ctx) => {
      const value = Number(text)
      if (!Number.isFinite(value)) {
        ctx.addIssue({ code: 'custom', message: 'Enter a number' })
      } else if (spec.whole && !Number.isInteger(value)) {
        ctx.addIssue({ code: 'custom', message: 'Enter a whole number' })
      } else if (spec.unit === '%' && Math.round(value * 10) / 10 !== value) {
        ctx.addIssue({ code: 'custom', message: 'Use at most one decimal' })
      } else if (value < min || value > max) {
        ctx.addIssue({ code: 'custom', message: `Between ${min} and ${max}` })
      }
    })
}

export const toNumber = (text: string) => (text.trim() === '' ? Number.NaN : Number(text))

export function sumWeights(values: SettingsFormValues): number {
  const total = WEIGHT_FIELDS.reduce((sum, spec) => sum + toNumber(values[spec.name]), 0)
  return Math.round(total * 10) / 10
}

export const WEIGHT_TOTAL_PERCENT = 100

export function buildSettingsFormSchema(limits: DispatchLimits) {
  const shape = Object.fromEntries(
    ALL_FIELDS.map((spec) => [spec.name, numberField(spec, limits)]),
  ) as Record<FieldName, ReturnType<typeof numberField>>

  return z.object(shape).superRefine((values, ctx) => {
    const start = toNumber(values.startRadiusKm)
    const widest = toNumber(values.maxRadiusKm)
    if (Number.isFinite(start) && Number.isFinite(widest) && start > widest) {
      ctx.addIssue({
        code: 'custom',
        path: ['startRadiusKm'],
        message: 'The first search distance cannot be bigger than the widest',
      })
    }
    const total = sumWeights(values)
    if (Number.isFinite(total) && total !== WEIGHT_TOTAL_PERCENT) {
      ctx.addIssue({
        code: 'custom',
        path: ['wNoShow'],
        message: `The five weights must add up to ${WEIGHT_TOTAL_PERCENT}. They add up to ${total}.`,
      })
    }
  })
}

// Only what differs from the saved settings, in the backend's shape. The weights are sent as a full set
// as soon as one of them changes, because the backend checks that the five add up to 1.
export function toChanges(
  values: SettingsFormValues,
  settings: DispatchSettings,
): UpdateDispatchSettingsPayload {
  const changes: UpdateDispatchSettingsPayload = {}
  for (const spec of ALL_FIELDS) {
    if (spec.limit === 'weight') continue
    const value = toNumber(values[spec.name])
    if (value !== spec.read(settings)) spec.write(changes, value)
  }
  if (WEIGHT_FIELDS.some((spec) => toNumber(values[spec.name]) !== spec.read(settings))) {
    for (const spec of WEIGHT_FIELDS) spec.write(changes, toNumber(values[spec.name]))
  }
  return changes
}

export type ChangeLine = { name: FieldName; label: string; unit: string; from: number; to: number }

// "Time to answer an offer: 15 -> 10 minutes", for the confirmation. The weights are listed as a set.
export function describeChanges(
  values: SettingsFormValues,
  settings: DispatchSettings,
): ChangeLine[] {
  return ALL_FIELDS.flatMap((spec): ChangeLine[] => {
    const to = toNumber(values[spec.name])
    const from = spec.read(settings)
    return to === from ? [] : [{ name: spec.name, label: spec.label, unit: spec.unit, from, to }]
  })
}

// The backend names a bad field by its own path (`waitMinutes.critical`); the form names it by its box.
export function toFieldName(path: string): FieldName | undefined {
  return ALL_FIELDS.find((spec) => spec.path === path)?.name
}

export const FIELD_NAMES: readonly FieldName[] = ALL_FIELDS.map((spec) => spec.name)

export type { FieldSpec }
