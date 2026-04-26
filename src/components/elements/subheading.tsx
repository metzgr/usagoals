import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Subheading({
  children,
  className,
  ...props
}: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "font-display text-[2rem]/10 tracking-tight text-pretty text-taupe-950 sm:text-5xl/14 dark:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}
