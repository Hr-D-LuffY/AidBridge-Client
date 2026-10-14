import { ChartNoAxesColumn, EyeOff, MapPinned, MessagesSquare, Package, Tent } from 'lucide-react'
import type { ReactNode } from 'react'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { BentoCard } from './bento-card'
import {
  AnalyticsVisual,
  ChatVisual,
  NearbyVisual,
  PrivacyVisual,
  StockVisual,
} from './bento-visuals'
import { NEEDS } from './landing-content'

function TileIcon({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={`grid size-12 place-items-center rounded-2xl ${tone}`}>{children}</span>
}

// Six capabilities straight under the hero, as a bento grid with a small animated drawing in each
// tile. Real capabilities only: no numbers about users, no reviews, because there are none to show.
export function Highlights() {
  return (
    <section aria-label="What AidBridge does" className="page-container mt-4 pb-16 sm:pb-24">
      <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" gap={0.1}>
        <StaggerItem className="md:col-span-2">
          <BentoCard featured className="grid gap-8 sm:grid-cols-[1fr_1.1fr] sm:items-center">
            <div>
              <TileIcon tone="bg-accent text-accent-foreground">
                <MapPinned aria-hidden="true" className="size-6" />
              </TileIcon>
              <h2 className="mt-5 text-2xl">Nearest help first</h2>
              <p className="mt-2 text-base text-pretty text-muted-foreground">
                Volunteers see open requests around them, nearest first, up to 50 km away. People in
                need find relief camps the same way.
              </p>
            </div>
            <NearbyVisual />
          </BentoCard>
        </StaggerItem>

        <StaggerItem>
          <BentoCard className="flex flex-col justify-between gap-6">
            <div>
              <TileIcon tone="bg-info-soft text-info">
                <EyeOff aria-hidden="true" className="size-6" />
              </TileIcon>
              <h2 className="mt-5 text-xl">Private until accepted</h2>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">
                Volunteers see an area about a kilometre wide. Only the one who accepts sees where
                you really are.
              </p>
            </div>
            <PrivacyVisual />
          </BentoCard>
        </StaggerItem>

        <StaggerItem>
          <BentoCard className="flex flex-col justify-between gap-6">
            <div>
              <TileIcon tone="bg-success-soft text-success">
                <MessagesSquare aria-hidden="true" className="size-6" />
              </TileIcon>
              <h2 className="mt-5 text-xl">A chat for every request</h2>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">
                Talk to the volunteer on the way. Admins can read along, but never write.
              </p>
            </div>
            <ChatVisual />
          </BentoCard>
        </StaggerItem>

        <StaggerItem className="md:col-span-2">
          <BentoCard featured className="grid gap-8 sm:grid-cols-[1fr_1.1fr] sm:items-center">
            <div>
              <TileIcon tone="bg-warning-soft text-warning">
                <Tent aria-hidden="true" className="size-6" />
              </TileIcon>
              <h2 className="mt-5 text-2xl">Camps that know their stock</h2>
              <p className="mt-2 text-base text-pretty text-muted-foreground">
                NGOs run camps with a capacity, track supplies, and get an alert before an item runs
                out. Every hand-out is recorded.
              </p>
            </div>
            <StockVisual />
          </BentoCard>
        </StaggerItem>

        <StaggerItem className="md:col-span-2">
          <BentoCard className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <TileIcon tone="bg-secondary text-secondary-foreground">
                <Package aria-hidden="true" className="size-6" />
              </TileIcon>
              <div>
                <h2 className="text-xl">One list of needs</h2>
                <p className="mt-1 text-sm text-pretty text-muted-foreground">
                  A request and a camp&apos;s stock use the same six categories, so what is asked
                  for and what is on the shelf line up.
                </p>
              </div>
            </div>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {NEEDS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border bg-background px-2 py-3 text-xs font-semibold transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <Icon aria-hidden="true" className="size-5 text-primary" />
                  {label}
                </li>
              ))}
            </ul>
          </BentoCard>
        </StaggerItem>

        <StaggerItem>
          <BentoCard className="flex flex-col justify-between gap-6">
            <div>
              <TileIcon tone="bg-accent text-accent-foreground">
                <ChartNoAxesColumn aria-hidden="true" className="size-6" />
              </TileIcon>
              <h2 className="mt-5 text-xl">The whole picture</h2>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">
                Admins track incidents, send alerts and read live analytics.
              </p>
            </div>
            <AnalyticsVisual />
          </BentoCard>
        </StaggerItem>
      </Stagger>
    </section>
  )
}
