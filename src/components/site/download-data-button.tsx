import Link from "next/link";

import { Button } from "@/components/ui/button";

export function DownloadDataButton() {
  return (
    <Button
      asChild
      variant="secondary"
      size="lg"
      className="h-10 rounded-full px-4"
    >
      <Link href="/api/download" prefetch={false} download>
        Download data
      </Link>
    </Button>
  );
}
