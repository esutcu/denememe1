import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-white/20 hover:border-white/30 hover:scale-105",
        destructive:
          "bg-red-500/20 backdrop-blur-md border border-red-400/30 text-red-100 shadow-lg hover:bg-red-500/30 hover:border-red-400/50 hover:scale-105",
        outline:
          "border border-white/20 bg-white/5 backdrop-blur-md shadow-lg text-white/90 hover:bg-white/10 hover:border-white/30 hover:text-white hover:scale-105",
        "outline-light":
          "border border-white/30 bg-white/5 backdrop-blur-md text-white hover:bg-white/15 hover:border-white/50 hover:scale-105",
        secondary:
          "bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-lg hover:bg-white/25 hover:border-white/40 hover:scale-105",
        ghost: "text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-sm hover:scale-105",
        link: "text-white/90 underline-offset-4 hover:underline hover:text-white",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-xl px-3 text-xs",
        lg: "h-10 rounded-xl px-8",
        xl: "text-lg px-8 py-3 rounded-xl",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
