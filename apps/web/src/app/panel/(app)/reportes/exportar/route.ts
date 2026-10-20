import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getReport } from "@/services/reports";
import { ExporterFactory } from "@/lib/reports/exporter-factory";
import { parseExportQuery } from "@/lib/reports/query";
import { reportFileName } from "@/lib/reports/types";

/**
 * Controlador de exportación de reportes:
 *   GET /panel/reportes/exportar?tipo=reservas|ingresos|clientes
 *       &formato=pdf|xlsx|csv&desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 * Valida parámetros (400) y sesión (401), pide el reporte al servicio (Modelo,
 * con RLS por dueño), obtiene la estrategia de `ExporterFactory` y devuelve el
 * archivo como descarga. Runtime Node: exceljs y jsPDF necesitan APIs de Node.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest) {
  const query = parseExportQuery(Object.fromEntries(request.nextUrl.searchParams));
  if (!query.ok) return errorResponse(400, query.error);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return errorResponse(401, "Inicia sesión para exportar reportes.");
  if (user.user_metadata?.account_type === "customer") {
    return errorResponse(403, "Solo el dueño del complejo puede exportar reportes.");
  }

  try {
    const data = await getReport(query.type, query.range);
    const exporter = ExporterFactory.create(query.format);
    const content = await exporter.export(data);
    const fileName = reportFileName(query.type, query.range, exporter.extension);

    return new NextResponse(content as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": exporter.contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[reportes/exportar]", err);
    return errorResponse(500, "No se pudo generar el reporte. Inténtalo de nuevo.");
  }
}
