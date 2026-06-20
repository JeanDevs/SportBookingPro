import { listCustomers } from '../../services/customers';
import { getMyFacility } from '../../services/facilities';
import { CustomersView } from './customers-view';

/**
 * Pantalla de Clientes (server component). Carga los clientes activos y el
 * complejo del propietario (ambos aislados por RLS) y delega la interaccion al
 * client component `CustomersView`.
 */
export default async function CustomersPage() {
  const [customers, facility] = await Promise.all([listCustomers(), getMyFacility()]);

  return (
    <CustomersView customers={customers} facilityName={facility?.name ?? 'Mi complejo'} />
  );
}
