import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import type { CatalogOwner } from "@/lib/catalog";

export function AgencyAvatar({
  owner,
  size = "default",
}: {
  owner: CatalogOwner;
  size?: "sm" | "default" | "lg";
}) {
  const fallbackLength = size === "sm" ? 2 : 3;
  const label = owner.abbreviation
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, fallbackLength);

  return (
    <Avatar size={size} title={owner.name}>
      <AvatarFallback className="font-medium tracking-tight">
        {label || "US"}
      </AvatarFallback>
    </Avatar>
  );
}
