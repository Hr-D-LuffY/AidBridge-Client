import {
  Activity,
  Backpack,
  Droplets,
  Flame,
  HeartPulse,
  type LucideIcon,
  Mountain,
  Waves,
  Wind,
} from 'lucide-react'

// Short preparedness guides for the home page. They are general, widely used safety advice, written
// for people who are reading before or during a disaster. They never replace the instructions of the
// local authorities or the emergency services, and the dialog that shows them says so.

export type GuideSection = { heading: string; items: readonly string[] }

export type Guide = {
  id: string
  title: string
  category: string
  icon: LucideIcon
  summary: string
  sections: readonly GuideSection[]
}

export const GUIDES: readonly Guide[] = [
  {
    id: 'flood',
    title: 'Staying safe in a flood',
    category: 'Flood',
    icon: Waves,
    summary:
      'What to prepare, when to move, and why floodwater is never safe to walk or drive through.',
    sections: [
      {
        heading: 'Before',
        items: [
          'Know the nearest high ground and shelter, and the way to reach it.',
          'Keep documents, medicine, a torch and a phone charger in a waterproof bag.',
          'Move valuables and electrical items to a higher place.',
        ],
      },
      {
        heading: 'During',
        items: [
          'Move to higher ground early. Do not wait for the water to reach you.',
          'Do not walk, swim or drive through floodwater. Moving water about 15 cm deep can knock an adult off their feet.',
          'Stay away from electrical equipment and fallen power lines when you are wet or standing in water.',
        ],
      },
      {
        heading: 'After',
        items: [
          'Treat floodwater as contaminated. Wash hands with safe water and soap.',
          'Drink only bottled or boiled water until the supply is declared safe.',
          'Return home only when the authorities say it is safe.',
        ],
      },
    ],
  },
  {
    id: 'cyclone',
    title: 'Getting ready for a cyclone',
    category: 'Cyclone',
    icon: Wind,
    summary: 'Follow the warnings, secure your home, and go to a shelter when you are told to.',
    sections: [
      {
        heading: 'Before',
        items: [
          'Follow the official warning signals and keep a battery or hand-crank radio.',
          'Bring loose objects indoors and secure doors, windows and roofing as well as you can.',
          'Store dry food and at least three days of drinking water for everyone in the house.',
        ],
      },
      {
        heading: 'When you are told to leave',
        items: [
          'Go to the nearest cyclone shelter straight away. Do not wait to see how bad it gets.',
          'Take medicine, documents, water, a torch and a charged phone with a power bank.',
          'Help children, older people and people with disabilities first.',
        ],
      },
      {
        heading: 'During and after',
        items: [
          'Stay indoors, away from windows, in the strongest part of the building.',
          'A calm patch can be the eye of the storm. The wind returns, so do not go outside.',
          'Keep away from fallen power lines and leave only when the authorities say it is safe.',
        ],
      },
    ],
  },
  {
    id: 'earthquake',
    title: 'Earthquake: drop, cover, hold on',
    category: 'Earthquake',
    icon: Activity,
    summary:
      'The three actions that protect you while the ground is shaking, and what to do after.',
    sections: [
      {
        heading: 'While it shakes',
        items: [
          'Drop to your hands and knees.',
          'Cover your head and neck under a sturdy table, or against an inside wall away from windows.',
          'Hold on until the shaking stops. Do not run outside while it is happening, and do not use a lift.',
          'If you are outdoors, move away from buildings, trees and power lines.',
        ],
      },
      {
        heading: 'Afterwards',
        items: [
          'Expect aftershocks and be ready to drop, cover and hold on again.',
          'Check yourself and others for injuries. Leave damaged buildings.',
          'If you smell gas, leave and do not switch anything on or light a flame.',
        ],
      },
    ],
  },
  {
    id: 'fire',
    title: 'Escaping a fire',
    category: 'Fire',
    icon: Flame,
    summary: 'Know two ways out, stay low under smoke, and never go back inside.',
    sections: [
      {
        heading: 'Before',
        items: [
          'Know two ways out of every room and keep them clear.',
          'Agree on a place outside where everyone meets.',
          'Keep a smoke alarm working if you have one.',
        ],
      },
      {
        heading: 'During',
        items: [
          'Get out and stay out. Call the emergency number from outside.',
          'Stay low under the smoke, where the air is clearer.',
          'Before opening a door, touch it with the back of your hand. If it is hot, do not open it.',
          'If your clothes catch fire: stop, drop to the ground and roll.',
        ],
      },
      {
        heading: 'After',
        items: ['Never go back inside until the fire service says it is safe.'],
      },
    ],
  },
  {
    id: 'landslide',
    title: 'Landslide warning signs',
    category: 'Landslide',
    icon: Mountain,
    summary: 'The signs that a slope is about to move, and how to get out of its path.',
    sections: [
      {
        heading: 'Warning signs',
        items: [
          'New cracks in the ground, in walls or in a road.',
          'Trees, poles or fences that start to lean.',
          'Sudden muddy water in a stream, or a stream that suddenly drops.',
          'A rumbling sound, or small amounts of soil and stones already falling.',
          'Heavy rain that lasts for hours or days on a steep slope.',
        ],
      },
      {
        heading: 'What to do',
        items: [
          'Leave early to stable ground, away from the slope and the valley below it.',
          'Move sideways out of the path of the slide, not straight down the slope.',
          'Do not go back until the authorities say the slope is safe.',
        ],
      },
    ],
  },
  {
    id: 'go-bag',
    title: 'Pack an emergency go-bag',
    category: 'Preparedness',
    icon: Backpack,
    summary:
      'A short checklist for a bag you can pick up and carry when you have to leave quickly.',
    sections: [
      {
        heading: 'Essentials',
        items: [
          'Drinking water and dry food for at least three days.',
          'A torch with spare batteries, and a whistle.',
          'Warm clothes or a blanket, and a change of clothes.',
        ],
      },
      {
        heading: 'Health',
        items: [
          'A basic first-aid kit.',
          'Any medicine you take every day, with enough for several days.',
          'Soap, a towel and hygiene items.',
        ],
      },
      {
        heading: 'Papers and contact',
        items: [
          'Copies of identity documents in a waterproof bag.',
          'Some cash in small notes.',
          'A power bank, and the phone numbers of your family written on paper.',
        ],
      },
    ],
  },
  {
    id: 'safe-water',
    title: 'Making water safe to drink',
    category: 'Water',
    icon: Droplets,
    summary: 'How to treat water when the supply is cut off or contaminated after a disaster.',
    sections: [
      {
        heading: 'Best option',
        items: ['Use bottled or packaged water that has not been in contact with floodwater.'],
      },
      {
        heading: 'If you have none',
        items: [
          'Let cloudy water settle and pour it through a clean cloth first.',
          'Bring it to a rolling boil for at least one minute, then let it cool.',
          'If you cannot boil it, use water purification tablets or chlorine drops and follow the label.',
          'Store treated water in a clean, covered container.',
        ],
      },
      {
        heading: 'Never',
        items: ['Do not drink floodwater, even if it looks clear.'],
      },
    ],
  },
  {
    id: 'first-aid',
    title: 'First aid: bleeding and burns',
    category: 'First aid',
    icon: HeartPulse,
    summary: 'Two common injuries and the first things to do while you wait for medical help.',
    sections: [
      {
        heading: 'Heavy bleeding',
        items: [
          'Press firmly on the wound with a clean cloth and keep pressing.',
          'If the cloth soaks through, add another on top. Do not remove the first.',
          'Raise the injured limb if you do not suspect a broken bone, and call for medical help.',
        ],
      },
      {
        heading: 'Burns',
        items: [
          'Cool the burn under cool running water for about 20 minutes.',
          'Take off rings and loose clothing near the burn unless they are stuck to the skin.',
          'Cover it loosely with a clean, non-fluffy material. Do not use ice, toothpaste or ointment, and do not burst blisters.',
          'Get medical help for large burns and for burns on the face, hands or genitals.',
        ],
      },
    ],
  },
]

// Reading time from the words of the guide itself, so the number on the card is true.
const WORDS_PER_MINUTE = 200

export function getReadMinutes(guide: Guide) {
  const text = [guide.summary, ...guide.sections.flatMap((s) => [s.heading, ...s.items])].join(' ')
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
