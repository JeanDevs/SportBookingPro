"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ExternalLink, Wallet } from "lucide-react";
import { Button, Badge, EmptyState, StatCard } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/panel/page-header";
import { validatePayment, rejectPayment, type OwnerPayment } from "@/services/payments";
import { formatPEN, formatLimaDate, formatLimaTime } from "@/lib/format";
import { PAYMENT_STATUS_META, PAYMENT_METHOD_META } from "@/lib/domain";

type Filter = "PENDING" | "ALL";

export function PagosView({ payments }: { payments: OwnerPayment[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<Filter>("PENDING");

  const pending = useMemo(
    () => payments.filter((p) => p.status === "PENDING_VALIDATION"),
    [payments],
  );
  const pendingTotal = pending.reduce((s, p) => s + p.amount, 0);
  const validatedTotal = useMemo(
    () => payments.filter((p) => p.status === "VALIDATED").reduce((s, p) => s + p.amount, 0),
    [payments],
  );

  const shown = filter === "PENDING" ? pending : payments;

  const act = (fn: () => Promise<unknown>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  return (
    <>
      <PageHeader eyebrow="Caja" title="Pagos" />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Por validar"
            value={String(pending.length)}
            icon={Wallet}
            hint={formatPEN(pendingTotal)}
            accent={pending.length > 0}
          />
          <StatCard label="Validado (histórico)" value={formatPEN(validatedTotal)} />
          <StatCard label="Movimientos" value={String(payments.length)} />
        </div>

        <div className="my-5 inline-flex rounded-xl border border-ink-700 bg-ink-900 p-1">
          {(["PENDING", "ALL"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                "rounded-lg px-4 py-1.5 text-sm font-semibold transition " +
                (filter === f ? "bg-lime-400 text-ink-950" : "text-ink-300 hover:text-ink-50")
              }
            >
              {f === "PENDING" ? "Por validar" : "Todos"}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={filter === "PENDING" ? "Nada por validar" : "Sin movimientos"}
            description={
              filter === "PENDING"
                ? "Cuando un cliente envíe un comprobante de adelanto aparecerá aquí."
                : "Los pagos registrados o recibidos se listarán aquí."
            }
          />
        ) : (
          <div className="space-y-3">
            {shown.map((p) => {
              const meta = PAYMENT_STATUS_META[p.status];
              const method = PAYMENT_METHOD_META[p.method];
              return (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-700/70 bg-ink-850/80 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-50">{p.customerName}</p>
                    <p className="truncate text-sm text-ink-400">
                      {p.fieldName}
                      {p.startAt ? ` · ${formatLimaDate(p.startAt)} ${formatLimaTime(p.startAt)}` : ""}
                    </p>
                  </div>
                  <div className="text-sm text-ink-300">
                    {p.kind === "DEPOSIT" ? "Adelanto" : "Saldo"} · {method.emoji} {method.label}
                  </div>
                  <p className="font-display font-bold text-ink-50">{formatPEN(p.amount)}</p>
                  {p.proofUrl ? (
                    <a
                      href={p.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-sky-300 hover:text-sky-200"
                    >
                      <ExternalLink size={14} /> Comprobante
                    </a>
                  ) : null}
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                  {p.status === "PENDING_VALIDATION" ? (
                    <div className="flex gap-1.5">
                      <Button size="sm" disabled={isPending} onClick={() => act(() => validatePayment(p.id))}>
                        <Check size={15} /> Validar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => act(() => rejectPayment(p.id))}
                        aria-label="Rechazar"
                      >
                        <X size={15} />
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </PageBody>
    </>
  );
}
