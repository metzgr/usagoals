import type { Metadata } from "next"
import Link from "next/link"

import { CatalogCard } from "@/components/catalog-card"
import { DiscoverToolbar } from "@/components/discover-toolbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { getOverview } from "@/lib/apex"
import {
  buildDiscoverHref,
  discoverKindLabels,
  discoverSortLabels,
  discoverStatusLabels,
  getDiscoverModel,
} from "@/lib/catalog"
import { formatCount } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Discover",
  description:
    "Catalog-style discover page for plans, goals, indicators, agencies, and collections from the live APEX corpus.",
}

type HomePageProps = {
  searchParams: Promise<{
    q?: string
    kind?: string
    status?: string
    sort?: string
    limit?: string
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const overview = await getOverview()
  const model = getDiscoverModel(overview, params)

  return (
    <div className="flex flex-col gap-6 pb-8">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Discover
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Browse the federal strategy catalog.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              Plans, goals, indicators, collections, and agency profiles derived
              from the live APEX API. This is the working application surface,
              not a marketing homepage.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {formatCount(model.totals.plans)} plans
            </Badge>
            <Badge variant="secondary">
              {formatCount(model.totals.goals)} goals
            </Badge>
            <Badge variant="secondary">
              {formatCount(model.totals.indicators)} indicators
            </Badge>
            <Badge variant="secondary">
              {formatCount(model.totals.collections)} collections
            </Badge>
            <Badge variant="secondary">
              {formatCount(model.totals.agencies)} active agencies
            </Badge>
          </div>
        </div>
      </section>

      <DiscoverToolbar state={model.state} kindCounts={model.kindCounts} />

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {formatCount(model.totalMatches)} records match the current filters.
          </p>
          <p className="text-sm text-muted-foreground">
            Showing {formatCount(model.visibleMatches.length)}{" "}
            {model.state.kind === "all"
              ? "catalog results"
              : discoverKindLabels[model.state.kind].toLowerCase()}
            {" "}sorted by{" "}
            {discoverSortLabels[model.state.sort].toLowerCase()}.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            Status: {discoverStatusLabels[model.state.status]}
          </Badge>
          <Badge variant="outline">
            Scope: {discoverKindLabels[model.state.kind]}
          </Badge>
        </div>
      </section>

      {model.visibleMatches.length > 0 ? (
        <>
          <section className="columns-1 gap-4 md:columns-2 xl:columns-3 2xl:columns-4">
            {model.visibleMatches.map((item) => (
              <CatalogCard key={item.id} item={item} />
            ))}
          </section>

          {model.canShowMore ? (
            <div className="flex justify-center pt-2">
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link
                  href={buildDiscoverHref(model.state, {
                    limit: model.state.limit + 18,
                  })}
                >
                  Show more
                </Link>
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <Empty className="rounded-3xl border border-dashed border-border bg-card py-16">
          <EmptyHeader>
            <EmptyTitle>No catalog records match this view.</EmptyTitle>
            <EmptyDescription>
              Try clearing the query or widening the status filter. The current
              dataset is still sparse in some categories.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild variant="outline">
              <Link href="/">Reset discover view</Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  )
}
