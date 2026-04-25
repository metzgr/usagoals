"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  { href: "/", label: "Discover" },
  { href: "/explore", label: "Search" },
  { href: "/compare", label: "Compare" },
  { href: "/discovery-lab", label: "Lab" },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-1 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] sm:flex-row sm:items-center sm:justify-between">
          <span>Prototype experience</span>
          <span className="text-primary-foreground/70">
            Built from public federal strategy data. Not an official government
            website.
          </span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold">
              US
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                USA Goals
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Federal strategy catalog
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn("rounded-full", isActive && "shadow-none")}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <a
              href="https://apex.app.cloud.gov/api/openapi.json"
              target="_blank"
              rel="noreferrer"
            >
              API Docs
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
