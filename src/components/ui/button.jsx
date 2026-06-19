// @ts-nocheck
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "anchor-btn inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-white text-slate-900 shadow-[0_14px_32px_rgba(0,0,0,0.22)] hover:bg-white/95",
        destructive:
          "bg-red-500/20 text-red-200 border border-red-400/30 hover:bg-red-500/30",
        outline:
          "border border-white/16 bg-white/8 text-white/90 hover:bg-white/12",
        secondary:
          "bg-white/10 text-white/90 border border-white/14 hover:bg-white/15",
        ghost: "hover:bg-white/10 text-white/80",
        link: "text-[#9FB5FF] underline-offset-4 hover:underline anchor-btn--compact !min-h-0 !px-0",
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
