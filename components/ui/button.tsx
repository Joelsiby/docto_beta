import * as React from "react"
import { cn } from "@/lib/utils/format"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "glass" | "doctor" | "patient" | "danger" | "success"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-on-primary hover:bg-primary-container": variant === "default",
            "border border-outline bg-background hover:bg-surface-container hover:text-foreground": variant === "outline",
            "hover:bg-surface-container hover:text-foreground": variant === "ghost",
            "text-primary underline-offset-4 hover:underline": variant === "link",
            "glass-card hover:bg-surface-glass text-foreground": variant === "glass",
            "bg-doc-primary text-white hover:bg-doc-primary-light": variant === "doctor",
            "bg-pat-primary text-white hover:bg-pat-primary-light": variant === "patient",
            "bg-error text-on-error hover:bg-error-container hover:text-on-error-container": variant === "danger",
            "bg-success text-white hover:bg-medical-success/90": variant === "success",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
