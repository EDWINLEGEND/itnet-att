import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900 text-zinc-50 shadow-2xs hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900",
        secondary:
          "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-100",
        destructive:
          "bg-rose-500/15 text-rose-700 dark:text-rose-400",
        outline: "bg-muted/50 text-muted-foreground",
        emerald:
          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
        amber:
          "bg-amber-500/15 text-amber-800 dark:text-amber-300",
        cyan:
          "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
        purple:
          "bg-purple-500/15 text-purple-700 dark:text-purple-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
