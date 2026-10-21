import { getReport } from "@/services/reports";
import { parsePageQuery } from "@/lib/reports/query";
import type { ReportData } from "@/lib/reports/types";
import { ReportesView } from "./reportes-view";

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { type, range, error } = parsePageQuery(await searchParams);

  let report: ReportData | null = null;
  let loadError = error;
  try {
    report = await getReport(type, range);
  } catch {
    loadError = "No se pudo cargar el reporte. Inténtalo de nuevo.";
  }

  return <ReportesView type={type} range={range} report={report} error={loadError} />;
}
