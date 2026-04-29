"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Share2 } from "lucide-react";

import { CatalogPreviewModeButton } from "@/components/site/catalog-preview-mode-button";
import { DownloadDataButton } from "@/components/site/download-data-button";
import { ExploreHeaderSearch } from "@/components/site/explore-header-search";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname.startsWith("/goals/")) {
    return <GoalHeader />;
  }

  return (
    <header className="sticky top-0 z-50 h-[78px] bg-[#18181b]">
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
            className="h-auto w-14 invert"
          />
        </Link>

        <Suspense fallback={null}>
          <ExploreHeaderSearch />
        </Suspense>

        <div className="ml-auto">
          {pathname === "/" ? <DownloadDataButton /> : null}
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
