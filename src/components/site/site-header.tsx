import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { DownloadDataButton } from "@/components/site/download-data-button";
import { ExploreHeaderSearch } from "@/components/site/explore-header-search";

export function SiteHeader() {
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
