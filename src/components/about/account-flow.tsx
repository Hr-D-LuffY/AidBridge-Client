import {
  ArrowDown,
  ArrowRight,
  ClipboardCheck,
  HandHeart,
  KeyRound,
  LifeBuoy,
  type LucideIcon,
  ShieldCheck,
  Tent,
  UserPlus,
} from 'lucide-react'
import { DrawLine } from '@/components/motion/draw-line'
import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'

type NodeProps = { icon: LucideIcon; title: string; text: string; tone: string }

function FlowNode({ icon: Icon, title, text, tone }: NodeProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center shadow-soft lg:max-w-52">
      <span className={cn('grid size-11 place-items-center rounded-xl', tone)}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="font-bold">{title}</p>
      <p className="text-xs text-pretty text-muted-foreground">{text}</p>
    </div>
  )
}

// The text on an arrow between two nodes. Down on small screens, across on wide ones.
function FlowLink({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-1 text-center lg:flex-1 lg:px-2">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <ArrowDown className="size-5 text-primary lg:hidden" aria-hidden="true" />
      <span className="relative hidden w-full items-center lg:flex">
        <DrawLine className="w-full bg-primary/50" />
        <ArrowRight className="absolute -right-1 size-4 text-primary" aria-hidden="true" />
      </span>
    </div>
  )
}

const ADMIN_TONE = 'bg-warning-soft text-warning'

// How each of the four roles comes into existence. Two paths: anyone can sign up and then apply to
// volunteer; an admin creates NGO and admin accounts. Each node rises in, and the arrows draw across.
export function AccountFlow() {
  return (
    <div className="flex flex-col gap-10">
      <Reveal>
        <h3 className="mb-4 text-lg">The public path</h3>
        <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
          <FlowNode
            icon={UserPlus}
            title="Anyone"
            text="Signs up on the site"
            tone="bg-secondary text-secondary-foreground"
          />
          <FlowLink label="starts as" />
          <FlowNode
            icon={LifeBuoy}
            title="Person in need"
            text="Can ask for help straight away"
            tone="bg-accent text-accent-foreground"
          />
          <FlowLink label="applies to volunteer" />
          <FlowNode
            icon={ClipboardCheck}
            title="An admin reviews"
            text="Approves or rejects, with a note"
            tone={ADMIN_TONE}
          />
          <FlowLink label="if approved" />
          <FlowNode
            icon={HandHeart}
            title="Volunteer"
            text="The role replaces the first one"
            tone="bg-info-soft text-info"
          />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <h3 className="mb-4 text-lg">The admin path</h3>
        <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
          <FlowNode
            icon={ShieldCheck}
            title="An admin"
            text="Is the only one who can create these"
            tone={ADMIN_TONE}
          />
          <FlowLink label="creates and sets the first password" />
          <FlowNode
            icon={KeyRound}
            title="Hands it over"
            text="The new user changes it after logging in"
            tone="bg-secondary text-secondary-foreground"
          />
          <FlowLink label="which gives" />
          <div className="flex flex-1 flex-col gap-2 sm:flex-row lg:max-w-md">
            <FlowNode
              icon={Tent}
              title="NGO"
              text="Runs camps and stock"
              tone="bg-success-soft text-success"
            />
            <FlowNode
              icon={ShieldCheck}
              title="Admin"
              text="Coordinates the response"
              tone={ADMIN_TONE}
            />
          </div>
        </div>
      </Reveal>
    </div>
  )
}
