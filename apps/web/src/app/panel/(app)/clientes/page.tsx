import { listCustomers } from "@/services/customers";
import { ClientesView } from "./clientes-view";

export default async function ClientesPage() {
  const customers = await listCustomers();
  return <ClientesView customers={customers} />;
}
