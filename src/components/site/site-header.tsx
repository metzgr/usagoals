"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Share2 } from "lucide-react";

import { DownloadDataButton } from "@/components/site/download-data-button";
import { ExploreHeaderSearch } from "@/components/site/explore-header-search";

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
          <DownloadDataButton />
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
    <header className="sticky top-0 z-50 h-16 border-b border-white/10 bg-[#18181b]/95 backdrop-blur">
      <div className="flex h-full items-center justify-between px-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-[#dadee4] transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <button
          type="button"
          onClick={() => void sharePage()}
          className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-[#dadee4] transition hover:text-white"
        >
          Share
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-white text-[#18181b]">
            <Share2 className="size-4" />
          </span>
        </button>
      </div>
    </header>
  );
}
