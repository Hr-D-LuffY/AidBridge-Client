'use client'

import { Plus, Save, X } from 'lucide-react'
import { useId, useState } from 'react'
import { SkillPicker } from '@/components/shared/skill-chips'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MAX_LANGUAGES, MAX_VOLUNTEER_SKILLS } from '@/lib/skills'
import type { UpdateProfilePayload, UserProfile } from '@/types'
import { useUpdateProfile } from '../user.queries'
import { languageSchema } from '../user.schema'
import { ErrorLine } from './error-line'

const sameList = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((item, index) => item === b[index])

// "Bangla" and "bangla" are the same language to the backend.
const hasLanguage = (list: readonly string[], value: string) =>
  list.some((item) => item.toLowerCase() === value.toLowerCase())

function LanguagesEditor({
  value,
  onChange,
}: {
  value: string[]
  onChange: (next: string[]) => void
}) {
  const inputId = useId()
  const hintId = useId()
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const full = value.length >= MAX_LANGUAGES

  function add() {
    if (draft.trim() === '') return
    const parsed = languageSchema.safeParse(draft)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check this language.')
      return
    }
    if (hasLanguage(value, parsed.data)) {
      setError(`${parsed.data} is already in your list.`)
      return
    }
    onChange([...value, parsed.data])
    setDraft('')
    setError(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-base font-semibold">
          Languages you speak
        </label>
        <p id={hintId} className="text-sm text-muted-foreground">
          Up to {MAX_LANGUAGES}, so people can be matched with someone they understand.
        </p>
      </div>

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((language) => (
            <li
              key={language}
              className="inline-flex min-h-11 items-center gap-1 rounded-full border bg-card pl-4 text-sm font-medium"
            >
              {language}
              <button
                type="button"
                aria-label={`Remove ${language}`}
                onClick={() => onChange(value.filter((item) => item !== language))}
                className="mr-1 inline-flex size-9 cursor-pointer items-center justify-center rounded-full outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          id={inputId}
          value={draft}
          disabled={full}
          maxLength={40}
          placeholder={full ? 'Remove one to add another' : 'For example Bangla'}
          aria-describedby={hintId}
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            setDraft(event.target.value)
            setError(null)
          }}
          onKeyDown={(event) => {
            // Enter adds the language instead of submitting anything.
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
          className="h-12 rounded-xl"
        />
        <Button
          type="button"
          variant="outline"
          className="h-12 gap-2 px-4"
          disabled={full || draft.trim() === ''}
          onClick={add}
        >
          <Plus aria-hidden="true" />
          Add
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

// The editor starts from what is saved and is rebuilt (see the key in SkillsSettings) after a save, so a
// finished edit never lingers. Only the lists that changed are sent: each replaces the saved list.
function SkillsEditor({ profile }: { profile: UserProfile }) {
  const save = useUpdateProfile('Skills and languages saved.')
  const [skills, setSkills] = useState(profile.skills)
  const [languages, setLanguages] = useState(profile.languages)

  const skillsChanged = !sameList(skills, profile.skills)
  const languagesChanged = !sameList(languages, profile.languages)

  function submit() {
    const changes: UpdateProfilePayload = {}
    if (skillsChanged) changes.skills = skills
    if (languagesChanged) changes.languages = languages
    save.mutate(changes)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold">What you can help with</p>
          <p className="text-sm text-muted-foreground">
            Up to {MAX_VOLUNTEER_SKILLS}. It helps you stand out for requests that need them. You
            still see every request, with or without a skill.
          </p>
        </div>
        <SkillPicker
          legend="What you can help with"
          value={skills}
          onChange={setSkills}
          max={MAX_VOLUNTEER_SKILLS}
          disabled={save.isPending}
        />
      </div>

      <LanguagesEditor value={languages} onChange={setLanguages} />

      {save.isError && <ErrorLine error={save.error} />}

      <div>
        <Button
          type="button"
          className="h-11 gap-2 px-5"
          disabled={(!skillsChanged && !languagesChanged) || save.isPending}
          onClick={submit}
        >
          <Save aria-hidden="true" />
          {save.isPending ? 'Saving…' : 'Save skills and languages'}
        </Button>
      </div>
    </div>
  )
}

// Volunteers only: what they can do and which languages they speak.
export function SkillsSettings({ profile }: { profile: UserProfile }) {
  return (
    <SkillsEditor
      key={`${profile.skills.join(',')}|${profile.languages.join(',')}`}
      profile={profile}
    />
  )
}
