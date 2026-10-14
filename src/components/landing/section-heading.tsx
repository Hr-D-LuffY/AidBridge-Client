import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'

type SectionHeadingProps = {
  id: string
  eyebrow: string
  title: string
  text?: string
  align?: 'left' | 'center'
}

// Eyebrow, title and one supporting line, revealed together. `id` is for aria-labelledby on the section.
export function SectionHeading({ id, eyebrow, title, text, align = 'left' }: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'flex max-w-2xl flex-col gap-3',
        align === 'center' && 'mx-auto items-center text-center',
      )}
    >
      <p className="text-sm font-bold tracking-widest text-link uppercase">{eyebrow}</p>
      <h2 id={id} className="text-3xl text-balance sm:text-4xl">
        {title}
      </h2>
      {text && <p className="text-lg text-pretty text-muted-foreground">{text}</p>}
    </Reveal>
  )
}
