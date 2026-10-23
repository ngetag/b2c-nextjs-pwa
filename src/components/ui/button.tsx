import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-[0_0_0_1px_rgb(0_245_255_/_0.14),0_14px_30px_rgb(0_245_255_/_0.16)] hover:bg-[var(--color-primary-hover)] hover:shadow-[0_0_0_1px_rgb(0_245_255_/_0.22),0_18px_36px_rgb(0_245_255_/_0.22)]",
        secondary:
          "border border-[var(--color-border)] bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
        outline:
          "border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-foreground)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]",
        ghost:
          "text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-primary)]",
        destructive:
          "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] hover:opacity-90",
        link:
          "text-[var(--color-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
