import Link from "next/link";

import { Button } from "@/components/ui/button";

export function DownloadDataButton() {
  return (
    <Button
      asChild
      variant="ghost"
      size="lg"
      className="h-10 rounded-full bg-[#343538] p-0 text-[#dadee4] hover:bg-[#3f4043] hover:text-[#dadee4]"
    >
      <Link href="/api/download" prefetch={false} download>
        <span className="inline-flex h-full items-center rounded-full px-4 text-sm font-medium">
          Download data
        </span>
      </Link>
    </Button>
  );
}
