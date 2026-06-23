import { forwardRef } from "react";
import { cn } from "./cn";

const controlBase =
  "w-full rounded-xl border border-ink-700 bg-ink-900/70 px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-400 outline-none transition focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15 disabled:opacity-50";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(controlBase, className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(controlBase, "min-h-[88px] resize-y", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        controlBase,
        "appearance-none pr-10 [&>option]:bg-ink-850 [&>option]:text-ink-100",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 8l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
));
Select.displayName = "Select";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-300",
        className,
      )}
      {...props}
    />
  );
}

export interface FieldProps {
  label?: string;
  htmlFor?: string;
  error?: string | null | undefined;
  hint?: string | undefined;
  children: React.ReactNode;
  className?: string | undefined;
}

/** Envoltura label + control + ayuda/error para formularios consistentes. */
export function Field({ label, htmlFor, error, hint, children, className }: FieldProps) {
  return (
    <div className={cn("block", className)}>
      {label ? <Label htmlFor={htmlFor}>{label}</Label> : null}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-300">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}
