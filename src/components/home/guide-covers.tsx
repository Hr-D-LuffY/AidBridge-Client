import type { ReactNode } from 'react'

// One drawn cover per guide, in the colour of the tile it sits on (everything uses currentColor, kept
// faint so the title stays readable). They fill the tile and are cropped to fit, so they work at any
// tile size. Decoration only.

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 3,
  strokeLinecap: 'round',
} as const

function Wave({ y, opacity }: { y: number; opacity: number }) {
  return (
    <path
      {...STROKE}
      opacity={opacity}
      d={`M-20 ${y} q35 -28 70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0`}
    />
  )
}

const COVERS: Record<string, ReactNode> = {
  flood: (
    <>
      <circle cx="320" cy="70" r="34" fill="currentColor" opacity="0.12" />
      {[150, 178, 206, 234, 262, 290].map((y, i) => (
        <Wave key={y} y={y} opacity={0.4 - i * 0.05} />
      ))}
    </>
  ),
  cyclone: (
    <>
      {[26, 52, 78, 104, 130, 156].map((r, i) => (
        <circle
          key={r}
          cx="280"
          cy="120"
          r={r}
          {...STROKE}
          opacity={0.38 - i * 0.04}
          strokeDasharray={`${34 + i * 8} ${16 + i * 4}`}
          transform={`rotate(${i * 40} 280 120)`}
        />
      ))}
      <circle cx="280" cy="120" r="8" fill="currentColor" opacity="0.4" />
    </>
  ),
  earthquake: (
    <>
      {[70, 110, 150, 190, 230].map((y) => (
        <path key={y} d={`M0 ${y} H400`} stroke="currentColor" strokeWidth="1" opacity="0.12" />
      ))}
      <path
        {...STROKE}
        opacity="0.45"
        d="M0 150 H70 L88 105 L106 195 L126 70 L146 230 L168 120 L184 165 L206 150 H400"
      />
    </>
  ),
  fire: (
    <>
      <path
        fill="currentColor"
        opacity="0.16"
        d="M300 290 C220 250 240 190 290 120 C300 170 370 190 350 250 C342 275 320 292 300 290 Z"
      />
      <path
        fill="currentColor"
        opacity="0.16"
        d="M215 290 C170 262 180 220 212 175 C220 205 262 218 252 258 C246 278 232 290 215 290 Z"
      />
      <path
        fill="currentColor"
        opacity="0.2"
        d="M300 290 C268 272 276 240 296 210 C302 232 326 242 320 266 C316 280 308 290 300 290 Z"
      />
    </>
  ),
  landslide: (
    <>
      <path fill="currentColor" opacity="0.13" d="M0 110 L400 250 L400 300 L0 300 Z" />
      <path {...STROKE} opacity="0.35" d="M0 110 L400 250" />
      {[
        [90, 150, 14],
        [150, 190, 10],
        [215, 205, 18],
        [290, 245, 12],
        [340, 262, 8],
      ].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="currentColor" opacity="0.28" />
      ))}
      <path {...STROKE} opacity="0.25" d="M60 60 L90 90 L75 120 M300 40 L318 80" />
    </>
  ),
  'go-bag': (
    <>
      <rect x="250" y="70" width="110" height="150" rx="28" {...STROKE} opacity="0.4" />
      <path {...STROKE} opacity="0.4" d="M285 70 V52 a20 20 0 0 1 40 0 V70" />
      <rect x="270" y="150" width="70" height="50" rx="12" {...STROKE} opacity="0.3" />
      <path {...STROKE} opacity="0.3" d="M250 110 H230 M360 110 H380" />
      <circle cx="90" cy="230" r="46" fill="currentColor" opacity="0.1" />
    </>
  ),
  'safe-water': (
    <>
      <path
        fill="currentColor"
        opacity="0.14"
        d="M290 40 C290 40 230 120 230 165 a60 60 0 0 0 120 0 C350 120 290 40 290 40 Z"
      />
      <path
        {...STROKE}
        opacity="0.4"
        d="M290 40 C290 40 230 120 230 165 a60 60 0 0 0 120 0 C350 120 290 40 290 40 Z"
      />
      {[250, 270, 290].map((y, i) => (
        <ellipse
          key={y}
          cx="290"
          cy={y}
          rx={34 + i * 22}
          ry={7 + i * 3}
          {...STROKE}
          opacity={0.32 - i * 0.08}
          strokeWidth="2"
        />
      ))}
    </>
  ),
  'first-aid': (
    <>
      <path
        fill="currentColor"
        opacity="0.14"
        d="M325 60 h40 v44 h44 v40 h-44 v44 h-40 v-44 h-44 v-40 h44 Z"
      />
      <path
        {...STROKE}
        opacity="0.4"
        d="M0 235 H120 L140 200 L165 270 L190 180 L212 245 L228 235 H400"
      />
    </>
  ),
}

// The art sits in the top part of the tile and fades out downward, so the title and summary below it
// are always on a plain background.
export function GuideCover({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
      className="absolute inset-x-0 top-0 -z-10 h-[55%] w-full [mask-image:linear-gradient(to_bottom,black_45%,transparent)] transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    >
      {COVERS[id]}
    </svg>
  )
}
