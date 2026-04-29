"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCatalogPreviewMode, type CatalogPreviewMode } from "@/lib/catalog-preview";

const previewLabels: Record<CatalogPreviewMode, string> = {
  network: "Preview network.",
  summary: "Preview summary.",
};

export function CatalogPreviewModeButton() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = getCatalogPreviewMode(searchParams.get("preview"));

  if (pathname !== "/explore") {
    return null;
  }

  function selectMode(nextMode: string) {
    const previewMode = getCatalogPreviewMode(nextMode);
    const params = new URLSearchParams(searchParams);

    if (previewMode === "summary") {
      params.set("preview", previewMode);
    } else {
      params.delete("preview");
    }

    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}#discovery`, {
      scroll: false,
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="h-10 rounded-full bg-[#343538] p-0 text-[#dadee4] hover:bg-[#3f4043] hover:text-[#dadee4]"
        >
          <span className="inline-flex h-full items-center rounded-full pl-4 pr-3 text-sm font-medium">
            {previewLabels[mode]}
            <ChevronDown data-icon="inline-end" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[190px] border-[#343538] bg-[#27272a] text-[#dadee4]"
      >
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup value={mode} onValueChange={selectMode}>
            <DropdownMenuRadioItem value="network" className="cursor-pointer">
              Preview network.
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="summary" className="cursor-pointer">
              Preview summary.
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
