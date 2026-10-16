import { ChartNoAxesColumn, EyeOff, Megaphone, Star, Tent } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  AnalyticsVisual,
  ChatVisual,
  NearbyVisual,
  StockVisual,
} from '@/components/landing/bento-visuals'
import { NEEDS } from '@/components/landing/landing-content'
import { SectionHeading } from '@/components/landing/section-heading'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { cn } from '@/lib/utils'

// Eight tiles of different sizes and colours: a map-like list, a chat, a privacy note, a rating, stock
// bars, the six needs, alerts and analytics. Three tiles use the inverted, red and soft-blue colours so
// the grid has a rhythm instead of eight identical boxes.

function Tile({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <StaggerItem className={cn('min-w-0', className)}>
      <div className="relative isolate h-full overflow-hidden rounded-3xl border p-6 shadow-soft transition-shadow hover:shadow-card sm:p-7">
        {children}
      </div>
    </StaggerItem>
  )
}

function TileText({ title, text, big = false }: { title: string; text: string; big?: boolean }) {
  return (
    <div>
      <h3 className={big ? 'text-2xl' : 'text-xl'}>{title}</h3>
      <p className="mt-2 text-sm text-pretty opacity-80 sm:text-base">{text}</p>
    </div>
  )
}

const ICON_TILE = 'grid size-11 place-items-center rounded-xl bg-current/10 [&>svg]:size-5'

export function FeatureBento() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="page-container scroll-mt-20 py-16 sm:py-20"
    >
      <SectionHeading
        id="features-heading"
        eyebrow="What it does"
        title="Everything a response needs, in one place"
        text="Requests, volunteers, camps, supplies and alerts share one record, so nothing is lost between hands."
      />

      <Stagger
        className="mt-10 grid gap-4 md:grid-cols-2 lg:auto-rows-[minmax(13rem,auto)] lg:grid-cols-4"
        gap={0.07}
      >
        {/* Nearest help first: the big one. */}
        <Tile className="md:col-span-2 lg:row-span-2">
          <div className="absolute inset-0 -z-10 bg-linear-to-br from-accent via-card to-card" />
          {/* Radar rings behind the list, filling the space between the words and the bars. */}
          {[88, 62, 36].map((size) => (
            <span
              key={size}
              aria-hidden="true"
              className="absolute top-[55%] -right-12 -z-10 hidden -translate-y-1/2 rounded-full border border-dashed border-primary/25 md:block"
              style={{ width: `${size * 0.9}%`, aspectRatio: '1' }}
            />
          ))}
          <div className="flex h-full flex-col justify-between gap-8">
            <TileText
              big
              title="Nearest help first"
              text="Volunteers see open requests around them, nearest first. People in need find relief camps the same way."
            />
            <NearbyVisual />
          </div>
        </Tile>

        {/* A chat for every request: tall. */}
        <Tile className="lg:row-span-2">
          <div className="absolute inset-0 -z-10 bg-card" />
          <div className="flex h-full flex-col justify-between gap-6">
            <TileText
              title="A chat for every request"
              text="Talk to the volunteer on the way. Admins can read along, but never write."
            />
            <ChatVisual />
          </div>
        </Tile>

        <Tile>
          <div className="absolute inset-0 -z-10 bg-info-soft" />
          <div className="flex h-full flex-col gap-4">
            <span className={cn(ICON_TILE, 'text-info')}>
              <EyeOff aria-hidden="true" />
            </span>
            <TileText
              title="Private until accepted"
              text="Volunteers see a first name and an area about a kilometre wide."
            />
          </div>
        </Tile>

        {/* Solid red tile with the rating. */}
        <Tile>
          <div className="absolute inset-0 -z-10 bg-primary text-primary-foreground" />
          <div className="flex h-full flex-col justify-between gap-4 text-primary-foreground">
            <ul className="flex gap-1" aria-label="Five stars">
              {[0, 1, 2, 3, 4].map((star) => (
                <li key={star}>
                  <Star aria-hidden="true" className="size-6 fill-current" />
                </li>
              ))}
            </ul>
            <TileText
              title="Ratings that mean something"
              text="The person helped rates the volunteer from 1 to 5. The average is their reliability score."
            />
          </div>
        </Tile>

        <Tile className="md:col-span-2">
          <div className="absolute inset-0 -z-10 bg-card" />
          <div className="grid h-full gap-6 sm:grid-cols-[1fr_1.1fr] sm:items-center">
            <div className="flex flex-col gap-4">
              <span className={cn(ICON_TILE, 'text-primary')}>
                <Tent aria-hidden="true" />
              </span>
              <TileText
                title="Camps that know their stock"
                text="NGOs run camps with a capacity, track supplies and get an alert before an item runs out."
              />
            </div>
            <StockVisual />
          </div>
        </Tile>

        {/* Inverted tile: the six needs as small icons. */}
        <Tile>
          <div className="absolute inset-0 -z-10 bg-foreground" />
          <div className="flex h-full flex-col justify-between gap-5 text-background">
            <TileText
              title="One list of needs"
              text="Requests and camps use the same six categories."
            />
            <ul className="grid grid-cols-3 gap-2">
              {NEEDS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex flex-col items-center gap-1 rounded-xl bg-background/10 py-2 text-[0.7rem] font-semibold"
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </Tile>

        <Tile>
          <div className="absolute inset-0 -z-10 bg-secondary" />
          <div className="flex h-full flex-col gap-4">
            <span className={cn(ICON_TILE, 'text-primary')}>
              <Megaphone aria-hidden="true" />
            </span>
            <TileText
              title="Emergency alerts"
              text="Broadcast to everyone or to chosen roles, and email the urgent ones."
            />
          </div>
        </Tile>

        <Tile className="md:col-span-2 lg:col-span-4">
          <div className="absolute inset-0 -z-10 bg-linear-to-r from-card via-card to-accent" />
          <div className="grid gap-6 sm:grid-cols-[1.2fr_1fr] sm:items-center">
            <div className="flex flex-col gap-4">
              <span className={cn(ICON_TILE, 'text-primary')}>
                <ChartNoAxesColumn aria-hidden="true" />
              </span>
              <TileText
                big
                title="The whole picture"
                text="Admins read live analytics: requests by status, response times, volunteer activity and aid handed out."
              />
            </div>
            <AnalyticsVisual />
          </div>
        </Tile>
      </Stagger>
    </section>
  )
}
