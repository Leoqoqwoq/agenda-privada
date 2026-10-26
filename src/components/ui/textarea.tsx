import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[96px] w-full rounded-xl border border-rose-200/90 bg-white px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-rose-300/80 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rose)]/25 focus-visible:border-[var(--rose)] disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";
