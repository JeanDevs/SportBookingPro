import Link from "next/link";
import { MapPin, Goal, ArrowRight, Search, CalendarCheck, ShieldCheck } from "lucide-react";
import { getPublicFacilities } from "@/services/public-catalog";
import { SiteHeader, SiteFooter } from "@/components/public/site-header";
import { AmenityChips } from "@/components/public/amenity-chips";
import { OwnerCta } from "@/components/public/owner-cta";
import { FaqSection, SocialProof } from "@/components/public/faq-section";
import { Badge, EmptyState } from "@/components/ui";
import { formatPEN } from "@/lib/format";

export default async function LandingPage() {
  const facilities = await getPublicFacilities();

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-800">
        <div className="absolute inset-0 bg-grid-ink [background-size:36px_36px] opacity-30" />
        <div className="absolute inset-0 bg-lime-radial" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <Badge tone="lime" dot className="mx-auto mb-5">
            Reserva online · Paga tu adelanto · Listo
          </Badge>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight text-ink-50 sm:text-6xl">
            Reserva tu cancha en{" "}
            <span className="text-lime-400">segundos</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-300">
            Encuentra complejos cerca de ti, mira la disponibilidad en tiempo real y asegura tu
            horario con un adelanto. Sin llamadas, sin esperas.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a
              href="#complejos"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-lime-400 px-6 font-semibold text-ink-950 shadow-glow-sm hover:bg-lime-300"
            >
              <Search size={18} /> Ver complejos
            </a>
            <Link
              href="/panel"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-ink-600 px-6 font-semibold text-ink-100 hover:bg-ink-800"
            >
              Soy un complejo
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-ink-400">
            <span className="flex items-center gap-2">
              <CalendarCheck size={16} className="text-lime-400" /> Disponibilidad real
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-lime-400" /> Tu horario, asegurado
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-lime-400" /> Complejos en Lima
            </span>
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section id="complejos" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14 sm:px-8">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-50">Complejos disponibles</h2>
            <p className="mt-1 text-sm text-ink-400">Elige dónde quieres jugar.</p>
          </div>
          <span className="text-sm text-ink-400">{facilities.length} complejos</span>
        </div>

        {facilities.length === 0 ? (
          <EmptyState
            icon={Goal}
            title="Aún no hay complejos publicados"
            description="Pronto verás canchas para reservar. Si tienes un complejo, publícalo desde el panel."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((f) => (
              <Link
                key={f.id}
                href={`/c/${f.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-850/80 p-6 transition hover:border-lime-400/40 hover:shadow-glow"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-lime-400/15 text-2xl">
                    🏟️
                  </span>
                  {f.minPrice != null ? (
                    <div className="text-right">
                      <p className="text-xs text-ink-400">desde</p>
                      <p className="font-display font-bold text-lime-300">{formatPEN(f.minPrice)}</p>
                    </div>
                  ) : null}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink-50">{f.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-400">
                  <MapPin size={14} /> {f.district ?? f.address ?? "Lima"}
                </p>
                <AmenityChips keys={f.amenities} max={3} className="mt-3" />
                <div className="mt-4 flex items-center justify-between border-t border-ink-800 pt-4">
                  <span className="text-sm text-ink-300">
                    {f.fieldCount} {f.fieldCount === 1 ? "cancha" : "canchas"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-lime-300">
                    Reservar <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <SocialProof names={facilities.map((f) => f.name)} />
      <OwnerCta />
      <FaqSection />

      <SiteFooter />
    </>
  );
}
