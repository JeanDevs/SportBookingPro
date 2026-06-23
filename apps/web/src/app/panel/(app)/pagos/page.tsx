import { listPayments } from "@/services/payments";
import { PagosView } from "./pagos-view";

export default async function PagosPage() {
  const payments = await listPayments();
  return <PagosView payments={payments} />;
}
