import Link from "next/link"
import {
  ArrowUpRightIcon,
  Building2Icon,
  FileTextIcon,
  FlagIcon,
  Layers3Icon,
  LineChartIcon,
} from "lucide-react"

import { discoverStatusLabels, type CatalogItem } from "@/lib/catalog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type CatalogCardProps = {
  item: CatalogItem
}

const kindConfig = {
  collections: {
    label: "Collection",
    icon: Layers3Icon,
  },
  agencies: {
    label: "Agency",
    icon: Building2Icon,
  },
  plans: {
    label: "Plan",
    icon: FileTextIcon,
  },
  goals: {
    label: "Goal",
    icon: FlagIcon,
  },
  indicators: {
    label: "Indicator",
    icon: LineChartIcon,
  },
} as const

export function CatalogCard({ item }: CatalogCardProps) {
  const config = kindConfig[item.kind]
  const Icon = config.icon

  return (
    <Card className="mb-4 break-inside-avoid rounded-2xl border border-border/80 shadow-none">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline" className="gap-1">
            <Icon />
            {config.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {item.yearLabel ?? discoverStatusLabels[item.status]}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-balance text-lg leading-snug font-semibold">
            {item.title}
          </CardTitle>
          <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {item.subtitle}
          </CardDescription>
        </div>
        <CardAction>
          <Button asChild variant="ghost" size="icon-sm">
            <Link href={item.href} aria-label={`Open ${item.title}`}>
              <ArrowUpRightIcon />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {item.metrics.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {item.metrics.map((metric) => (
              <div
                key={`${item.id}-${metric.label}`}
                className="rounded-xl border border-border/70 bg-muted/40 px-3 py-3"
              >
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <p className="text-sm leading-6 text-muted-foreground line-clamp-6">
          {item.description}
        </p>

        {item.tags.length > 0 ? (
          <>
            <Separator />
            <div className="flex flex-wrap gap-2">
              {item.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </>
        ) : null}
      </CardContent>
      <CardFooter className="justify-between gap-3 bg-muted/30">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>{item.ownerAbbreviation.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{item.owner}</p>
            <p className="truncate text-xs text-muted-foreground">{item.ownerMeta}</p>
          </div>
        </div>
        <Badge
          variant={
            item.status === "active"
              ? "secondary"
              : item.status === "emerging"
                ? "secondary"
                : "outline"
          }
        >
          {discoverStatusLabels[item.status]}
        </Badge>
      </CardFooter>
    </Card>
  )
}
