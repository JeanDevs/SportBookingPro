import { forwardRef } from "react";
import { cn } from "./cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap select-none outline-none disabled:opacity-50 disabled:pointer-events-none";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-lime-400 text-ink-950 hover:bg-lime-300 shadow-glow-sm active:translate-y-px",
  secondary:
    "bg-ink-800 text-ink-100 border border-ink-700 hover:bg-ink-750 hover:border-ink-600",
  outline:
    "border border-ink-600 text-ink-100 hover:bg-ink-800 hover:border-ink-500",
  ghost: "text-ink-200 hover:bg-ink-800 hover:text-ink-50",
  danger: "bg-red-500/90 text-white hover:bg-red-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

/** Genera las clases de un botón — útil para estilar `<Link>`/`<a>` como botón. */
export function buttonClasses(opts?: {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  className?: string | undefined;
}): string {
  const { variant = "primary", size = "md", className } = opts ?? {};
  return cn(base, variantClasses[variant], sizeClasses[size], className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  ),
);
Button.displayName = "Button";
