"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileChartColumn, FileDown, FileSpreadsheet, FileText, Search } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  EmptyState,
  Field,
  Input,
  Select,
  Spinner,
  StatCard,
  buttonClasses,
} from "@/components/ui";
import { PageHeader, PageBody } from "@/components/panel/page-header";
import { formatCell, formatGeneratedAt, formatMoney } from "@/lib/reports/format-cell";
import {
  REPORT_TYPES,
  isNumericColumn,
  validateRange,
  type ReportData,
  type ReportFormat,
  type ReportRange,
  type ReportType,
} from "@/lib/reports/types";

const EXPORTS: { format: ReportFormat; label: string; icon: typeof FileText }[] = [
  { format: "pdf", label: "Exportar PDF", icon: FileText },
  { format: "xlsx", label: "Exportar Excel", icon: FileSpreadsheet },
  { format: "csv", label: "Exportar CSV", icon: FileDown },
];

function exportHref(type: ReportType, range: ReportRange, format: ReportFormat): string {
  const qs = new URLSearchParams({ tipo: type, formato: format, desde: range.from, hasta: range.to });
  return `/panel/reportes/exportar?${qs.toString()}`;
}

export function ReportesView({
  type,
  range,
  report,
  error,
}: {
  type: ReportType;
  range: ReportRange;
  report: ReportData | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Estado del formulario (borrador); `type`/`range` de props es lo aplicado y exportable.
  const [draftType, setDraftType] = useState<ReportType>(type);
  const [from, setFrom] = useState(range.from);
  const [to, setTo] = useState(range.to);
  const [formError, setFormError] = useState<string | null>(null);

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateRange(from, to);
    setFormError(err);
    if (err) return;
    const qs = new URLSearchParams({ tipo: draftType, desde: from, hasta: to });
    startTransition(() => router.push(`/panel/reportes?${qs.toString()}`));
  };

  // KPI principal: el último total monetario del reporte (total / monto).
  const moneyCol = report ? [...report.columns].reverse().find((c) => c.type === "money") : undefined;
  const mainTotal = moneyCol && report?.totals ? Number(report.totals[moneyCol.key] ?? 0) : 0;

  return (
    <>
      <PageHeader eyebrow="Análisis" title="Reportes" />
      <PageBody>
        <Card>
          <CardContent className="pt-5">
            <form onSubmit={apply} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-end">
              <Field label="Tipo de reporte" htmlFor="tipo">
                <Select
                  id="tipo"
                  value={draftType}
                  onChange={(e) => setDraftType(e.target.value as ReportType)}
                >
                  {(Object.keys(REPORT_TYPES) as ReportType[]).map((t) => (
                    <option key={t} value={t}>
                      {REPORT_TYPES[t].label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Desde" htmlFor="desde">
                <Input id="desde" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
              </Field>
              <Field label="Hasta" htmlFor="hasta">
                <Input id="hasta" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
              </Field>
              <Button type="submit" disabled={isPending} className="w-full lg:w-auto">
                {isPending ? <Spinner /> : <Search size={16} />} Ver reporte
              </Button>
            </form>
            <p className="mt-3 text-sm text-ink-400">{REPORT_TYPES[draftType].description}</p>
            {(formError ?? error) ? (
              <Alert className="mt-3">{formError ?? error}</Alert>
            ) : null}
          </CardContent>
        </Card>

        {report ? (
          <>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-display text-lg font-semibold text-ink-50">{report.title}</h2>
                <p className="text-sm text-ink-400">
                  {report.subtitle} · Generado el {formatGeneratedAt(report.generatedAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {EXPORTS.map(({ format, label, icon: Icon }) => (
                  <a
                    key={format}
                    href={exportHref(type, range, format)}
                    download
                    className={buttonClasses({ variant: "secondary", size: "sm" })}
                  >
                    <Icon size={15} /> {label}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <StatCard label="Filas" value={String(report.rows.length)} icon={FileChartColumn} />
              {moneyCol ? (
                <StatCard label={moneyCol.label} value={formatMoney(mainTotal)} accent={mainTotal > 0} />
              ) : null}
            </div>

            {report.rows.length === 0 ? (
              <EmptyState
                className="mt-6"
                icon={FileChartColumn}
                title="Sin datos en el período"
                description="Prueba con otro rango de fechas. Igual puedes exportar el reporte vacío."
              />
            ) : (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-700/70">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-ink-850 text-xs uppercase tracking-wide text-ink-400">
                    <tr>
                      {report.columns.map((c) => (
                        <th
                          key={c.key}
                          className={
                            "whitespace-nowrap px-4 py-3 font-semibold " +
                            (isNumericColumn(c.type) ? "text-right" : "text-left")
                          }
                        >
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-800">
                    {report.rows.map((row, i) => (
                      <tr key={i} className="bg-ink-900/40 hover:bg-ink-850/60">
                        {report.columns.map((c) => (
                          <td
                            key={c.key}
                            className={
                              "whitespace-nowrap px-4 py-2.5 " +
                              (isNumericColumn(c.type) ? "text-right tabular-nums text-ink-100" : "text-left text-ink-200")
                            }
                          >
                            {formatCell(row[c.key] ?? null, c.type)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                  {report.totals ? (
                    <tfoot className="border-t border-lime-400/30 bg-lime-400/10 font-semibold text-lime-200">
                      <tr>
                        {report.columns.map((c) => (
                          <td
                            key={c.key}
                            className={
                              "whitespace-nowrap px-4 py-3 " +
                              (isNumericColumn(c.type) ? "text-right tabular-nums" : "text-left")
                            }
                          >
                            {formatCell(report.totals?.[c.key] ?? null, c.type)}
                          </td>
                        ))}
                      </tr>
                    </tfoot>
                  ) : null}
                </table>
              </div>
            )}
          </>
        ) : null}
      </PageBody>
    </>
  );
}
