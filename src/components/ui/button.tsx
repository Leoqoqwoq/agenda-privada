import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rose)]/35 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--rose)] text-white hover:bg-[var(--rose-deep)] shadow-[0_10px_22px_-12px_rgba(196,92,122,0.75)] hover:-translate-y-0.5",
        secondary:
          "bg-[var(--petal)] text-[var(--rose-deep)] hover:bg-[var(--blush)] border border-rose-100",
        outline:
          "border border-rose-200 bg-white text-[var(--foreground)] hover:bg-rose-50/80 hover:border-rose-300",
        ghost: "hover:bg-rose-50 text-[var(--ink-soft)] hover:text-[var(--rose-deep)]",
        destructive: "bg-rose-600 text-white hover:bg-rose-700",
        link: "text-[var(--rose)] underline-offset-4 hover:underline hover:text-[var(--rose-deep)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
