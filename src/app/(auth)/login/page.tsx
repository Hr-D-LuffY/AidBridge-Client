import type { Metadata } from 'next'
import { AuthCard } from '@/features/auth/components/auth-card'
import { LoginForm } from '@/features/auth/components/login-form'
import { getAvailableDemoRoles } from '@/lib/auth/demo-credentials'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to AidBridge to ask for help, volunteer or manage relief.',
}

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect } = await searchParams

  return (
    <AuthCard mode="login" redirect={redirect}>
      <LoginForm redirect={redirect} demoRoles={getAvailableDemoRoles()} />
    </AuthCard>
  )
}
