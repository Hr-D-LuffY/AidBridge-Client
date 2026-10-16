// Site-wide facts shown in the footer. Only real values belong here: a link that is not filled in
// is simply not shown.

export const SITE_AUTHOR = 'Md. Habibur Rahman'

export type SocialId = 'github' | 'linkedin' | 'portfolio'

export type SocialLink = {
  id: SocialId
  label: string
  href: string
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/Hr-D-LuffY' },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/md-habib-ur-rahman/',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    href: 'https://md-habibur-rahman-17.vercel.app/',
  },
]

export type EmergencyContact = {
  number: string
  label: string
}

// National emergency lines, shown on the home page and in the footer. They are real numbers for
// Bangladesh. Check them against an official source before launch, and replace them if the platform
// serves another country: a wrong number on a disaster site is worse than none.
export const EMERGENCY_CONTACTS: readonly EmergencyContact[] = [
  { number: '999', label: 'National emergency service: police, fire and ambulance' },
  { number: '333', label: 'National helpline for government services and relief information' },
  { number: '16263', label: 'Health helpline of the Directorate General of Health Services' },
  { number: '109', label: 'Helpline for women and children facing violence' },
]
