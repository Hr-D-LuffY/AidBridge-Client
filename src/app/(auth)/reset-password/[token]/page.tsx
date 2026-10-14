import { LinkIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { resetTokenSchema } from '@/features/auth/auth.schema'
import { AuthCard } from '@/features/auth/components/auth-card'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Choose a new AidBridge password.',
  // The address carries a secret token, so keep it out of search results and referrers.
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

type ResetPasswordPageProps = {
  params: Promise<{ token: string }>
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = await params

  // A token of the wrong shape can never work, so say so now instead of after the user types a password.
  if (!resetTokenSchema.safeParse(token).success) {
    return (
      <AuthCard mode="reset-password">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive-soft p-4 text-sm">
            <LinkIcon className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold">This reset link is not valid</p>
              <p>
                It may be incomplete, expired or already used. Reset links work once, for 30
                minutes.
              </p>
            </div>
          </div>
          <Link
            href="/forgot-password"
            className={cn(buttonVariants(), 'h-12 w-full rounded-xl text-base')}
          >
            Request a new link
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard mode="reset-password">
      <ResetPasswordForm token={token} />
    </AuthCard>
  )
}
