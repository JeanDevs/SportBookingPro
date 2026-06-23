"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "./cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  closeDisabled?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

/**
 * Diálogo modal accesible: cierra con Esc / click en backdrop, bloquea el scroll
 * del fondo mientras está abierto. Estética dark con panel elevado.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeDisabled = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !closeDisabled) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, closeDisabled]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => !closeDisabled && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "w-full animate-scale-in rounded-t-3xl border border-ink-700 bg-ink-850 shadow-pop sm:rounded-2xl",
          sizeClasses[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !closeDisabled) && (
          <div className="flex items-start justify-between gap-4 border-b border-ink-700/70 px-5 py-4">
            <div>
              {title ? (
                <h3 className="font-display text-lg font-semibold text-ink-50">
                  {title}
                </h3>
              ) : null}
              {description ? (
                <p className="mt-0.5 text-sm text-ink-400">{description}</p>
              ) : null}
            </div>
            {!closeDisabled ? (
              <button
                type="button"
                onClick={onClose}
                className="-mr-1 -mt-1 rounded-lg p-1.5 text-ink-400 hover:bg-ink-800 hover:text-ink-100"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            ) : null}
          </div>
        )}
        <div className="px-5 py-5">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-3 border-t border-ink-700/70 px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
