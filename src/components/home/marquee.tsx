import { DISASTERS } from '@/components/landing/landing-content'

// A slow ticker of the kinds of disaster. The list is printed twice and the track slides half its
// width, so it loops without a jump. It pauses under the pointer or keyboard focus and stands still for
// people who asked for less motion. The second copy is hidden from screen readers.
export function Marquee() {
  return (
    <div className="group relative overflow-hidden border-y bg-background py-4 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <ul className="flex w-max animate-home-marquee gap-10 pr-10 group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[0, 1].map((copy) =>
          DISASTERS.map(({ icon: Icon, label }) => (
            <li
              key={`${copy}-${label}`}
              aria-hidden={copy === 1}
              className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-foreground/30 transition-colors hover:text-foreground sm:text-5xl"
            >
              <Icon aria-hidden="true" className="size-7 text-primary sm:size-10" />
              {label}
            </li>
          )),
        )}
      </ul>
    </div>
  )
}
