"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Share2 } from "lucide-react";

import { CatalogPreviewModeButton } from "@/components/site/catalog-preview-mode-button";
import { DownloadDataButton } from "@/components/site/download-data-button";
import { ExploreHeaderSearch } from "@/components/site/explore-header-search";
import { ThemeToggleButton } from "@/components/site/theme-toggle-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  if (pathname.startsWith("/goals/")) {
    return <GoalHeader />;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-[78px] bg-background text-foreground",
        !isHomePage && "dark",
      )}
    >
      <div className="relative flex h-full items-center px-6 max-[440px]:px-4">
        <Link
          href="/"
          aria-label="USA Goals home"
          className="inline-flex items-center"
        >
          <Image
            src="/usagoals-logo.svg"
            alt="USA Goals"
            width={56}
            height={28}
            priority
            className={cn("h-auto w-14", isHomePage ? "dark:invert" : "invert")}
          />
        </Link>

        <Suspense fallback={null}>
          <ExploreHeaderSearch />
        </Suspense>

        <div className="ml-auto flex items-center gap-2">
          {isHomePage ? (
            <>
              <DownloadDataButton />
              <ThemeToggleButton />
            </>
          ) : null}
          <Suspense fallback={null}>
            <CatalogPreviewModeButton />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

function GoalHeader() {
  const router = useRouter();

  async function sharePage() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
        return;
      }

      await navigator.clipboard?.writeText(window.location.href);
    } catch {
      // Users can cancel the native share sheet; no UI state needs to change.
    }
  }

  return (
    <header className="dark sticky top-0 z-50 h-16 border-b bg-background/95 text-foreground backdrop-blur">
      <div className="flex h-full items-center justify-between px-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft data-icon="inline-start" />
          Back
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => void sharePage()}
          className="rounded-full text-xs uppercase tracking-[0.14em]"
        >
          Share
          <Share2 data-icon="inline-end" />
        </Button>
      </div>
    </header>
  );
}
