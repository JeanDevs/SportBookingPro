import { listDayReservations } from "@/services/reservations";
import { listFields } from "@/services/fields";
import { listCustomers } from "@/services/customers";
import { limaDateInput } from "@/lib/format";
import { ReservasView } from "./reservas-view";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const date = sp.date && DATE_RE.test(sp.date) ? sp.date : limaDateInput();

  const [reservations, fields, customers] = await Promise.all([
    listDayReservations(date),
    listFields(),
    listCustomers(),
  ]);

  const activeFields = fields
    .filter((f) => f.status === "ACTIVE")
    .map((f) => ({ id: f.id, name: f.name, type: f.type, pricePerHour: f.pricePerHour }));

  return (
    <ReservasView
      date={date}
      reservations={reservations}
      fields={activeFields}
      customers={customers.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
