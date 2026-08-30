// @ts-nocheck
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "anchor-btn inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(37,99,235,0.35)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-white text-[var(--color-text-primary)] shadow-[0_14px_32px_rgba(0,0,0,0.22)] hover:bg-white/95",
        destructive:
          "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[rgba(220,38,38,0.3)] hover:bg-[rgba(220,38,38,0.15)]",
        outline:
          "border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)]",
        secondary:
          "bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[#e2e8f0]",
        ghost: "hover:bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]",
        link: "text-[var(--color-accent)] underline-offset-4 hover:underline anchor-btn--compact !min-h-0 !px-0",
      },
      size: {
        default: "anchor-btn--default anchor-btn--rounded",
        sm: "anchor-btn--compact anchor-btn--rounded",
        lg: "anchor-btn--default anchor-btn--rounded min-h-[56px] !px-8",
        icon: "anchor-btn--icon rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
