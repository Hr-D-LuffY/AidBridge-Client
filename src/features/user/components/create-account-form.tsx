'use client'

import { Mail, Phone, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormError } from '@/components/forms/form-error'
import { mapServerFieldErrors, setServerFieldError } from '@/components/forms/server-errors'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/lib/constants'
import type { CreateAccountPayload } from '@/types'
import { useCreateAccount } from '../user.queries'
import { type CreateAccountFormInput, createAccountFormSchema } from '../user.schema'

const FIELD_NAMES = ['name', 'email', 'role', 'phone', 'password'] as const

const CONFLICT_STATUS = 409

const ROLE_OPTIONS = [
  { value: 'ngo', label: 'NGO (runs camps and stock)' },
  { value: 'admin', label: 'Admin (runs the platform)' },
]

// Makes an NGO or admin account. Nobody can choose these roles for themselves, so this is the only way
// they exist. The admin picks the first password and hands it over (the page says so); the person
// should change it from their profile. The new account does not sign in here.
export function CreateAccountForm() {
  const router = useRouter()
  const create = useCreateAccount()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      role: '',
      phone: '',
      password: '',
    } as CreateAccountFormInput,
    validators: { onChange: createAccountFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      const fields = createAccountFormSchema.parse(value)
      const payload: CreateAccountPayload = {
        name: fields.name,
        email: fields.email,
        password: fields.password,
        role: fields.role as CreateAccountPayload['role'],
        ...(fields.phone && { phone: fields.phone }),
      }
      try {
        const user = await create.mutateAsync(payload)
        router.push(`/admin/users/${user.id}`)
      } catch (error) {
        // "Email already registered" belongs under the email field.
        if (isApiError(error) && error.status === CONFLICT_STATUS) {
          setServerFieldError(formApi, 'email', error.message)
        } else if (!mapServerFieldErrors(formApi, error, FIELD_NAMES)) {
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
      className="flex max-w-xl flex-col gap-5 rounded-2xl border bg-card p-4 sm:p-6"
    >
      <form.AppField name="role">
        {(field) => (
          <field.SelectField
            label="Account type"
            placeholder="Choose NGO or admin"
            options={ROLE_OPTIONS}
          />
        )}
      </form.AppField>

      <form.AppField name="name">
        {(field) => (
          <field.TextField
            label="Name"
            icon={UserRound}
            autoComplete="off"
            placeholder="The organisation or person"
          />
        )}
      </form.AppField>

      <form.AppField name="email">
        {(field) => <field.TextField label="Email" type="email" icon={Mail} autoComplete="off" />}
      </form.AppField>

      <form.AppField name="phone">
        {(field) => (
          <field.TextField label="Phone" type="tel" icon={Phone} optional autoComplete="off" />
        )}
      </form.AppField>

      <form.AppField name="password">
        {(field) => (
          <field.PasswordField
            label="First password"
            autoComplete="new-password"
            hint={`${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters with a letter and a number. Hand it to the person yourself: it is not emailed.`}
          />
        )}
      </form.AppField>

      <p className="rounded-xl bg-muted p-3 text-sm">
        Ask them to change this password from their profile after they sign in the first time.
      </p>

      <FormError message={serverError} />

      <form.AppForm>
        <form.SubmitButton>Create account</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
