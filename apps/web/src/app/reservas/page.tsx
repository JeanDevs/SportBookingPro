import { getMyFacility } from '../../services/facilities';
import { ReservasView } from './reservas-view';

/**
 * Pantalla de Reservas (server component). Carga el complejo del propietario para
 * mostrar su nombre real y delega la interacción a `ReservasView`. El calendario
 * usa datos de muestra: la lógica real de reservas es FASE 6.
 */
export default async function ReservationsPage() {
  const facility = await getMyFacility();
  return <ReservasView facilityName={facility?.name ?? 'Mi complejo'} />;
}
