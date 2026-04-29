"use client";

import { FileText, Waypoints } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCatalogPreviewMode } from "@/lib/catalog-preview";

export function CatalogPreviewModeButton() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = getCatalogPreviewMode(searchParams.get("preview"));
  const PreviewIcon = mode === "summary" ? FileText : Waypoints;

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
    <Select value={mode} onValueChange={selectMode}>
      <SelectTrigger
        aria-label="Catalog preview mode"
        className="!h-10 min-w-[170px] cursor-pointer rounded-lg border-[#3f4043] bg-transparent pl-3 pr-2.5 text-sm font-medium text-[#a8afb7] shadow-none hover:bg-[#27272a] focus-visible:ring-[#59A9FF]/40 [&_svg]:text-[#a8afb7]"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <PreviewIcon aria-hidden="true" data-icon="inline-start" />
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent
        align="end"
        position="popper"
        className="min-w-[190px] border-[#343538] bg-[#27272a] text-[#dadee4]"
      >
        <SelectGroup>
          <SelectItem value="network" className="cursor-pointer">
            Show network
          </SelectItem>
          <SelectItem value="summary" className="cursor-pointer">
            Show summary
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
