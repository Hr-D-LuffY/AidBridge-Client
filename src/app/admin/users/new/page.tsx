import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { CreateAccountForm } from '@/features/user/components/create-account-form'

export const metadata: Metadata = { title: 'Add an account' }

export default function NewAccountPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back={{ href: '/admin/users', label: 'Users' }}
        title="Add an NGO or admin account"
        description="Nobody can pick these roles when they sign up, so this is how an NGO or another admin gets an account."
      />
      <CreateAccountForm />
    </div>
  )
}
