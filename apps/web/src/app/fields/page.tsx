import { listFields } from '../../services/fields';
import { getMyFacility } from '../../services/facilities';
import { FieldsView } from './fields-view';

/**
 * Pantalla de Canchas (server component). Carga las canchas y el complejo del
 * propietario (ambos aislados por RLS) y delega la interaccion al client
 * component `FieldsView`. El gate del middleware garantiza que aqui siempre
 * existe un complejo.
 */
export default async function FieldsPage() {
  const [fields, facility] = await Promise.all([listFields(), getMyFacility()]);

  return <FieldsView fields={fields} facilityName={facility?.name ?? 'Mi complejo'} />;
}
