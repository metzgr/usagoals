"use client"

import { useState, useTransition, type FormEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import { SearchIcon, SlidersHorizontalIcon } from "lucide-react"

import {
  buildDiscoverHref,
  discoverKindLabels,
  discoverSortLabels,
  discoverStatusLabels,
  type DiscoverKind,
  type DiscoverSort,
  type DiscoverState,
  type DiscoverStatus,
} from "@/lib/catalog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type DiscoverToolbarProps = {
  state: DiscoverState
  kindCounts: Record<DiscoverKind, number>
}

const kindOptions = Object.entries(discoverKindLabels) as Array<
  [DiscoverKind, string]
>
const statusOptions = Object.entries(discoverStatusLabels) as Array<
  [DiscoverStatus, string]
>
const sortOptions = Object.entries(discoverSortLabels) as Array<
  [DiscoverSort, string]
>

export function DiscoverToolbar({
  state,
  kindCounts,
}: DiscoverToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  function push(updates: Partial<DiscoverState>) {
    startTransition(() => {
      router.push(buildDiscoverHref(state, updates))
    })
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextQuery = String(formData.get("q") ?? "").trim()

    push({
      q: nextQuery,
      limit: 18,
    })
  }

  function resetFilters() {
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasCustomState =
    state.q.length > 0 ||
    state.kind !== "all" ||
    state.status !== "active" ||
    state.sort !== "popular"

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          <form onSubmit={submitSearch} className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
            <FieldGroup className="flex-1">
              <Field>
                <FieldLabel htmlFor="discover-query">Search the catalog</FieldLabel>
                <Input
                  id="discover-query"
                  name="q"
                  defaultValue={state.q}
                  placeholder="Search goals, plans, indicators, agencies, and collections"
                />
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={isPending}>
              <SearchIcon data-icon="inline-start" />
              Search
            </Button>
          </form>

          <div className="hidden shrink-0 items-end gap-3 md:flex">
            <FieldGroup className="w-40">
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select
                  value={state.status}
                  onValueChange={(value) =>
                    push({
                      status: value as DiscoverStatus,
                      limit: 18,
                    })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      {statusOptions.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <FieldGroup className="w-40">
              <Field>
                <FieldLabel>Sort</FieldLabel>
                <Select
                  value={state.sort}
                  onValueChange={(value) =>
                    push({
                      sort: value as DiscoverSort,
                      limit: 18,
                    })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sort</SelectLabel>
                      {sortOptions.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontalIcon data-icon="inline-start" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Catalog filters</SheetTitle>
                  <SheetDescription>
                    Adjust status and sorting without leaving the discover page.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 px-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Status</FieldLabel>
                      <Select
                        value={state.status}
                        onValueChange={(value) =>
                          push({
                            status: value as DiscoverStatus,
                            limit: 18,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Status</SelectLabel>
                            {statusOptions.map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel>Sort</FieldLabel>
                      <Select
                        value={state.sort}
                        onValueChange={(value) =>
                          push({
                            sort: value as DiscoverSort,
                            limit: 18,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Sort</SelectLabel>
                            {sortOptions.map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                </div>
                <SheetFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileFiltersOpen(false)
                    }}
                  >
                    Close
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {hasCustomState ? (
              <Button variant="ghost" onClick={resetFilters}>
                Reset
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-foreground">Catalog categories</p>
            <p className="text-xs text-muted-foreground">
              {kindCounts.all} matching records in the current corpus
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {kindOptions.map(([value, label]) => {
              const isActive = state.kind === value

              return (
                <Button
                  key={value}
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  className={cn("rounded-full", !isActive && "bg-background")}
                  onClick={() =>
                    push({
                      kind: value,
                      limit: 18,
                    })
                  }
                >
                  {label}
                  <span className={cn("ml-1 text-xs", isActive && "text-primary-foreground/70")}>
                    {kindCounts[value]}
                  </span>
                </Button>
              )
            })}
          </div>

          {hasCustomState ? (
            <div className="hidden md:flex">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset filters
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
