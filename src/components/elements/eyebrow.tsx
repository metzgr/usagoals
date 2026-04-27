import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Eyebrow({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-sm/7 font-semibold text-taupe-700 dark:text-taupe-400",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
