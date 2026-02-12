import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#FF1B7E] text-white shadow-sm",
        secondary:
          "border-transparent bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
        destructive:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
        outline: "text-[var(--text-primary)] border-[var(--border-primary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }