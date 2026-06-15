import * as React from "react"
import { cn } from "@/lib/utils/format"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-on-primary": variant === "default",
          "border-transparent bg-secondary text-on-secondary": variant === "secondary",
          "border-transparent bg-error text-on-error": variant === "destructive",
          "border-transparent bg-success text-white": variant === "success",
          "border-transparent bg-[#F59E0B] text-white": variant === "warning",
          "text-foreground": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
