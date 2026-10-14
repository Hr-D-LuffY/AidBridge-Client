import {
  Activity,
  CircleHelp,
  Droplets,
  EyeOff,
  Flame,
  HandHeart,
  House,
  LifeBuoy,
  type LucideIcon,
  MessagesSquare,
  Mountain,
  Package,
  Pill,
  Scale,
  ShieldCheck,
  Shirt,
  Tent,
  Utensils,
  Waves,
  Wind,
} from 'lucide-react'

// Everything the public pages say. All of it describes what the backend really does (see
// server/docs/API.md), so no section invents a statistic, a testimonial or a promise.

export type RoleId = 'victim' | 'volunteer' | 'ngo' | 'admin'

export type RoleDetail = {
  id: RoleId
  icon: LucideIcon
  title: string
  summary: string
  capabilities: readonly string[]
  join: string
}

export const ROLE_DETAILS: readonly RoleDetail[] = [
  {
    id: 'victim',
    icon: LifeBuoy,
    title: 'People in need',
    summary: 'Ask for help and see it arrive.',
    capabilities: [
      'Raise an SOS: choose what you need, add your location, a note and up to 5 photos or videos',
      'Find relief camps near you and see how many places are free',
      'Chat with the volunteer assigned to you',
      'Rate your volunteer from 1 to 5 stars after the rescue',
      'Edit the request or close it with a reason',
      'Apply to become a volunteer yourself',
    ],
    join: 'Sign up. There is no role to pick: everyone starts here.',
  },
  {
    id: 'volunteer',
    icon: HandHeart,
    title: 'Volunteers',
    summary: 'Respond to the people closest to you.',
    capabilities: [
      'See open requests around you, nearest first, with the distance',
      'Accept a request, or decline it',
      'Mark yourself on the way, then completed',
      'Hand out supplies from the camps you are assigned to',
    ],
    join: 'Apply from a signed-in account. An admin approves it.',
  },
  {
    id: 'ngo',
    icon: Tent,
    title: 'NGOs',
    summary: 'Run camps and keep supplies moving.',
    capabilities: [
      'Run relief camps with a capacity and a place on the map',
      'Track stock, with an alert when an item runs low',
      'Assign volunteers to your camps',
      'Review every hand-out from your camps',
    ],
    join: 'Created by an admin, who sets the first password.',
  },
  {
    id: 'admin',
    icon: ShieldCheck,
    title: 'Admins',
    summary: 'Coordinate the whole response.',
    capabilities: [
      'Track incidents and link requests to them',
      'Approve volunteers and create NGO accounts',
      'Raise the priority of any request',
      'Send emergency alerts and read the analytics',
    ],
    join: 'Created by another admin. The first is set up by the team running the platform.',
  },
]

export type StageId = 'pending' | 'assigned' | 'on_the_way' | 'rescued' | 'closed'

export type Stage = {
  id: StageId
  label: string
  headline: string
  victim: string
  volunteer: string
  admin: string
}

// The real lifecycle of an SOS request (pending, assigned, on the way, rescued, closed).
export const STAGES: readonly Stage[] = [
  {
    id: 'pending',
    label: 'Pending',
    headline: 'The request is open',
    victim:
      'Your request is live. You can still edit it or add photos while you wait for someone to accept.',
    volunteer:
      'Volunteers searching within 50 km see it, nearest first: your first name, an approximate area, your needs and the priority. Not your phone, address or exact position.',
    admin:
      'Admins can raise the priority (low, medium, high or critical) and link the request to an incident.',
  },
  {
    id: 'assigned',
    label: 'Assigned',
    headline: 'A volunteer has accepted',
    victim:
      'You see who is coming, with their phone number, and a chat opens between the two of you.',
    volunteer:
      'Only one volunteer can claim a request. If two try at once, one wins. The winner sees the full details, including the exact location.',
    admin:
      'The request is closed to other volunteers. Admins can read the chat but cannot write in it.',
  },
  {
    id: 'on_the_way',
    label: 'On the way',
    headline: 'Help is moving',
    victim: 'The volunteer has set off. Keep your phone close and follow their messages.',
    volunteer:
      'You mark yourself on the way. You can also record supplies handed out from the camps you are assigned to.',
    admin: 'Each hand-out is deducted from the camp stock and appears in the NGO distribution log.',
  },
  {
    id: 'rescued',
    label: 'Rescued',
    headline: 'The volunteer marks it complete',
    victim: 'You can rate your volunteer from 1 to 5 stars.',
    volunteer: 'The task is complete. Your reliability score updates with the rating you receive.',
    admin:
      'The request counts toward the total rescued of the incident it is linked to, and toward the analytics.',
  },
  {
    id: 'closed',
    label: 'Closed',
    headline: 'The request is closed',
    victim:
      'You can close a request at any time with a short reason, for example when help is no longer needed. That frees one of your three open places.',
    volunteer: 'Closing cancels any task still open on the request, and the volunteer is notified.',
    admin: 'Closed requests stay on record, so reports and analytics stay accurate.',
  },
]

export type Need = { icon: LucideIcon; label: string; text: string }

// The six kinds of relief a request can ask for. NGO stock uses the same six categories.
export const NEEDS: readonly Need[] = [
  { icon: Utensils, label: 'Food', text: 'Meals and dry rations' },
  { icon: Pill, label: 'Medicine', text: 'Medical supplies and care' },
  { icon: House, label: 'Shelter', text: 'A safe place to stay' },
  { icon: Droplets, label: 'Water', text: 'Safe drinking water' },
  { icon: Shirt, label: 'Clothing', text: 'Clothes and blankets' },
  { icon: Package, label: 'Other', text: 'Anything not listed' },
]

export type Disaster = { icon: LucideIcon; label: string }

export const DISASTERS: readonly Disaster[] = [
  { icon: Waves, label: 'Flood' },
  { icon: Activity, label: 'Earthquake' },
  { icon: Flame, label: 'Fire' },
  { icon: Wind, label: 'Cyclone' },
  { icon: Mountain, label: 'Landslide' },
  { icon: CircleHelp, label: 'Other' },
]

export type Safeguard = { icon: LucideIcon; title: string; text: string }

export const SAFEGUARDS: readonly Safeguard[] = [
  {
    icon: EyeOff,
    title: 'Privacy before acceptance',
    text: 'Volunteers see a first name and an approximate area. The phone number, address, photos and exact position are shown only to the volunteer who accepts.',
  },
  {
    icon: ShieldCheck,
    title: 'Approved volunteers',
    text: 'Nobody can sign up as a volunteer, NGO or admin. Each role has exactly one way in, and the server checks it on every request.',
  },
  {
    icon: Scale,
    title: 'Fair limits',
    text: 'A person can have three unfinished requests at once and a volunteer can hold three active tasks, so help is spread out and requests are not spammed.',
  },
  {
    icon: MessagesSquare,
    title: 'Open about the chat',
    text: 'Only the victim and the assigned volunteer can write in a request chat. Admins can read it, to step in if something goes wrong, but cannot write.',
  },
]

export type FaqItem = { question: string; answer: string }

export const FAQ: readonly FaqItem[] = [
  {
    question: 'Does AidBridge replace the emergency services?',
    answer:
      'No. If you or someone near you is in immediate danger, call your local emergency number first. AidBridge coordinates the help that comes after, and the help the emergency services cannot reach.',
  },
  {
    question: 'Who can see where I am?',
    answer:
      'Volunteers who have not accepted your request see only your first name and an approximate area, rounded to about a kilometre. After one volunteer accepts, that volunteer sees your phone number, address, photos and exact position. Admins and NGOs can see the full details of a request.',
  },
  {
    question: 'How do I become a volunteer?',
    answer:
      'Sign up, add a phone number to your profile, and apply from your dashboard with a short message. An admin reviews every application. Once approved, your account becomes a volunteer account, and volunteers do not raise SOS requests themselves.',
  },
  {
    question: 'How are NGO and admin accounts created?',
    answer:
      'By an admin. There is no public sign-up for them. The admin chooses the first password and hands it over, and the new user can change it after logging in.',
  },
  {
    question: 'What can I attach to a request?',
    answer:
      'Photos and videos help a volunteer understand the situation. A request can hold up to five files (JPG, PNG, GIF, MP4, MOV or AVI).',
  },
  {
    question: 'How many requests can I have open?',
    answer:
      'Three unfinished requests at a time. Closing or completing one frees a place. Volunteers can hold up to three active tasks at once.',
  },
  {
    question: 'What if nobody accepts my request?',
    answer:
      'It stays open and visible to nearby volunteers. An admin can raise its priority, and you can edit it, add details or photos, or close it at any time.',
  },
  {
    question: 'What if I forget my password?',
    answer:
      'Use "Forgot password?" on the log in page. If an account exists for your email, we send a single-use link that works for 30 minutes.',
  },
]
