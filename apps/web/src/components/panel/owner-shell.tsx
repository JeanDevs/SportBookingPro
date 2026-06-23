"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Goal,
  Users,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { Logo } from "../brand/logo";
import { cn } from "../ui/cn";
import { signOut } from "../../services/auth";

const NAV = [
  { label: "Dashboard", href: "/panel", icon: LayoutDashboard },
  { label: "Reservas", href: "/panel/reservas", icon: CalendarDays },
  { label: "Canchas", href: "/panel/canchas", icon: Goal },
  { label: "Clientes", href: "/panel/clientes", icon: Users },
  { label: "Pagos", href: "/panel/pagos", icon: Wallet },
  { label: "Configuración", href: "/panel/configuracion", icon: Settings },
];

function NavLinks({ onNavigate = () => {} }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {NAV.map(({ label, href, icon: Icon }) => {
        const active = href === "/panel" ? pathname === "/panel" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            data-tour={href === "/panel/canchas" ? "nav-canchas" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
              active
                ? "bg-lime-400/15 text-lime-300 ring-1 ring-inset ring-lime-400/25"
                : "text-ink-300 hover:bg-ink-800 hover:text-ink-50",
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({
  facilityName,
  onNavigate = () => {},
}: {
  facilityName: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-2">
        <Logo subtitle="Panel del complejo" />
      </div>
      <p className="mt-6 truncate px-3 font-display text-lg font-semibold text-ink-50" title={facilityName}>
        {facilityName}
      </p>
      <div className="mt-5 flex-1">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="space-y-1 border-t border-ink-800 pt-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-300 transition hover:bg-ink-800 hover:text-ink-50"
        >
          <ExternalLink size={18} /> Ver sitio público
        </a>
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
        >
          <LogOut size={18} /> Salir
        </button>
      </div>
    </div>
  );
}

export function OwnerShell({
  facilityName,
  children,
}: {
  facilityName: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[268px_1fr]">
      {/* Sidebar escritorio */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-ink-800 bg-ink-900 px-4 py-6 lg:flex">
        <SidebarBody facilityName={facilityName} />
      </aside>

      {/* Top bar móvil */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-800 bg-ink-900/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-ink-200 hover:bg-ink-800"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Drawer móvil */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" />
          <aside
            className="absolute inset-y-0 left-0 w-72 border-r border-ink-800 bg-ink-900 px-4 py-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-ink-400 hover:bg-ink-800"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
            <SidebarBody facilityName={facilityName} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <main className="min-w-0">{children}</main>
    </div>
  );
}
