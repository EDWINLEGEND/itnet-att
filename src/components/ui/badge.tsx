import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900",
        secondary:
          "border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-100",
        destructive:
          "border-transparent bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20",
        outline: "text-zinc-950 dark:text-zinc-50 border-zinc-200 dark:border-zinc-800",
        emerald:
          "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        amber:
          "border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        cyan:
          "border-cyan-600/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
        purple:
          "border-purple-600/20 bg-purple-500/10 text-purple-700 dark:text-purple-400",
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
