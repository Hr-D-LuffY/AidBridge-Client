import Link from 'next/link'
import { useId } from 'react'
import { cn } from '@/lib/utils'

// The AidBridge emblem: a shield holding a relief cross over a bridge arch, with radar waves above for
// the distress call. This is the logo artwork, so its fixed colours are the one place hex values are
// allowed. The shield is dark on its own, so the mark reads on both the light and the dark theme.
export function Emblem({ className }: { className?: string }) {
  const id = useId()
  const red = `${id}-red`
  const bridge = `${id}-bridge`
  const glow = `${id}-glow`

  return (
    <svg viewBox="18 4 154 190" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={red} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff5c61" />
          <stop offset="100%" stopColor="#e51f26" />
        </linearGradient>
        <linearGradient id={bridge} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff5c61" />
          <stop offset="50%" stopColor="#edf2f8" />
          <stop offset="100%" stopColor="#5083f1" />
        </linearGradient>
        <filter id={glow} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <path
        d="M 95 10 L 165 40 L 165 118 C 165 156 95 186 95 186 C 95 186 25 156 25 118 L 25 40 Z"
        fill="#131b25"
        stroke="#263240"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M 95 20 L 155 46 L 155 114 C 155 146 95 172 95 172 C 95 172 35 146 35 114 L 35 46 Z"
        stroke="#ff5c61"
        strokeWidth="1.2"
        opacity="0.35"
      />
      <path
        d="M 55 60 A 52 52 0 0 1 135 60"
        stroke="#ff5c61"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
        strokeDasharray="3 5"
      />
      <path
        d="M 68 72 A 34 34 0 0 1 122 72"
        stroke="#ff5c61"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M 42 145 C 60 100, 130 100, 148 145"
        stroke={`url(#${bridge})`}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 54 153 C 70 120, 120 120, 136 153"
        stroke="#22303f"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M76 116V142" stroke="#abb6c4" strokeWidth="1.5" opacity="0.55" />
      <path d="M95 107V138" stroke="#abb6c4" strokeWidth="1.5" opacity="0.65" />
      <path d="M114 116V142" stroke="#abb6c4" strokeWidth="1.5" opacity="0.55" />
      <g transform="translate(95, 90)" filter={`url(#${glow})`}>
        <rect x="-8" y="-23" width="16" height="46" rx="4" fill={`url(#${red})`} />
        <rect x="-23" y="-8" width="46" height="16" rx="4" fill={`url(#${red})`} />
        <circle cx="0" cy="0" r="4" fill="#ffffff" />
      </g>
      <circle cx="95" cy="22" r="3.5" fill="#ff5c61" />
    </svg>
  )
}

type BrandLogoProps = {
  size?: 'default' | 'lg'
  // Where the logo links to. The wordmark is plain text when `href` is null (e.g. inside a link).
  href?: string | null
  className?: string
}

// The wordmark is live text, not part of the image, so it follows the theme and the site font.
export function BrandLogo({ size = 'default', href = '/', className }: BrandLogoProps) {
  const large = size === 'lg'
  const content = (
    <>
      <Emblem className={large ? 'h-14 w-auto' : 'h-9 w-auto sm:h-10'} />
      <span
        className={cn('font-extrabold tracking-tight', large ? 'text-4xl' : 'text-xl sm:text-2xl')}
      >
        <span className="text-foreground">Aid</span>
        <span className="text-primary">Bridge</span>
      </span>
    </>
  )
  const classes = cn('inline-flex items-center', large ? 'gap-3' : 'gap-2.5', className)

  if (href === null) return <span className={classes}>{content}</span>
  return (
    <Link
      href={href}
      aria-label="AidBridge home"
      className={cn(
        classes,
        'rounded-lg pointer-coarse:min-h-11 outline-none transition-opacity hover:opacity-85 focus-visible:ring-3 focus-visible:ring-ring/50',
      )}
    >
      {content}
    </Link>
  )
}
