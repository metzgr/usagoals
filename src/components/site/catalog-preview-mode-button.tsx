"use client";

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
        className="!h-10 min-w-[150px] cursor-pointer rounded-full border-0 bg-[#343538] py-0 pl-4 pr-3 text-sm font-medium text-[#dadee4] shadow-none hover:bg-[#3f4043] focus-visible:ring-[#59A9FF]/40 [&_svg]:text-[#dadee4]/70"
      >
        <SelectValue />
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
