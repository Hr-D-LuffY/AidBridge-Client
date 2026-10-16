// Everything the new home page says. Like the rest of the public pages it describes what the product
// really does (server/docs/API.md). The numbers are fixed rules of the product, not usage counts: there
// are no users to count yet, so nothing here pretends otherwise.

export type HeroSlide = {
  id: string
  badge: string
  headline: string
  accent: string
  text: string
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
}

export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: 'ask',
    badge: 'For people in need',
    headline: 'When disaster strikes, help should',
    accent: 'find you',
    text: 'Raise an SOS in a minute. Volunteers nearby, relief camps and the NGOs that stock them see it on one shared picture, so no request goes unseen.',
    primary: { label: 'Ask for help', href: '/register' },
    secondary: { label: 'Become a volunteer', href: '/register' },
  },
  {
    id: 'volunteer',
    badge: 'For volunteers',
    headline: 'Be the nearest pair of',
    accent: 'helping hands',
    text: 'See open requests around you, nearest first, up to 50 km away. Accept one, chat with the person, and mark each step until it is done.',
    primary: { label: 'Become a volunteer', href: '/register' },
    secondary: { label: 'See how it works', href: '/#how-it-works' },
  },
  {
    id: 'camps',
    badge: 'For NGOs and admins',
    headline: 'Keep every camp stocked and every request',
    accent: 'in sight',
    text: 'NGOs run relief camps with a capacity and a live stock list. Admins track incidents, raise priorities and send emergency alerts.',
    primary: { label: 'See what it can do', href: '/#features' },
    secondary: { label: 'Contact us', href: '/contact' },
  },
]

export type Stat = { value: string; label: string }

export const STATS: readonly Stat[] = [
  { value: '50 km', label: 'How far a volunteer can search for open requests' },
  { value: '~1 km', label: 'The area shown to volunteers before a request is accepted' },
  { value: '6', label: 'Relief categories shared by requests and camp stock' },
  { value: '5', label: 'Photos or videos that can be attached to one request' },
]

// How many of a role's abilities its card lists, so every card has the same height.
export const ROLE_CARD_POINTS = 3

export const WHILE_YOU_WAIT: readonly string[] = [
  'Stay where you are if it is safe. If the danger is rising, move to higher ground or a shelter.',
  'Keep your phone charged: lower the brightness and close the apps you do not need.',
  'Keep drinking water, medicine and your documents within reach.',
  'Keep your request open. Add details or photos if things change and answer your volunteer.',
  'Make yourself easy to find: a light, a bright cloth or a whistle helps rescuers see or hear you.',
]
