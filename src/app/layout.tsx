import type { Metadata } from 'next'
import { Atkinson_Hyperlegible } from 'next/font/google'
import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { publicEnv } from '@/lib/public-env'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import './globals.css'

// Designed for legibility: distinct letter shapes help in a hurry, on a small or dim screen.
const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson',
  display: 'swap',
})

export const metadata: Metadata = {
  // Makes every relative URL in the metadata (the share image, the sitemap) absolute.
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_APP_URL),
  title: { default: 'AidBridge', template: '%s | AidBridge' },
  description:
    'Disaster response and relief coordination: ask for help, volunteer, and connect people in crisis with the help they need.',
  applicationName: 'AidBridge',
  openGraph: { siteName: 'AidBridge', type: 'website', locale: 'en_US' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={atkinson.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
