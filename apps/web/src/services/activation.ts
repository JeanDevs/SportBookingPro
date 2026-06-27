'use server';

import { createClient } from '../lib/supabase/server';

/**
 * Estado de ACTIVACIÓN del dueño (derivado). Gobierna el onboarding y el
 * checklist de go-live del panel. El norte del producto B2B es mover al dueño
 * por este embudo hasta `PUBLISHED` y luego `ACTIVATED`:
 *
 *   REGISTERED → FACILITY_CREATED → BOOKABLE_READY → PUBLISHED → ACTIVATED
 *
 * Un complejo solo es VISIBLE y RESERVABLE en el marketplace cuando está
 * publicado (`is_published=true`) y tiene al menos una cancha activa CON
 * disponibilidad (sin horarios, `public_field_slots` devuelve 0 slots).
 */

export type ActivationState =
  | 'REGISTERED'
  | 'FACILITY_CREATED'
  | 'BOOKABLE_READY'
  | 'PUBLISHED'
  | 'ACTIVATED';

export interface ActivationStatus {
  state: ActivationState;
  facilityId: string | null;
  slug: string | null;
  hasFacility: boolean;
  hasActiveField: boolean;
  hasAvailability: boolean;
  isPublished: boolean;
  hasBooking: boolean;
  /** Precondiciones cumplidas para publicar (≥1 cancha activa con horario). */
  canPublish: boolean;
}

export async function getActivationStatus(): Promise<ActivationStatus> {
  const supabase = await createClient();

  const { data: facility } = await supabase
    .from('facilities')
    .select('id, slug, is_published')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!facility) {
    return {
      state: 'REGISTERED',
      facilityId: null,
      slug: null,
      hasFacility: false,
      hasActiveField: false,
      hasAvailability: false,
      isPublished: false,
      hasBooking: false,
      canPublish: false,
    };
  }

  const { data: activeFields } = await supabase
    .from('fields')
    .select('id')
    .eq('status', 'ACTIVE');
  const activeFieldIds = (activeFields ?? []).map((f) => f.id as string);
  const hasActiveField = activeFieldIds.length > 0;

  let hasAvailability = false;
  if (hasActiveField) {
    const { data: rules } = await supabase
      .from('field_availability_rules')
      .select('field_id')
      .in('field_id', activeFieldIds)
      .eq('is_active', true)
      .limit(1);
    hasAvailability = (rules ?? []).length > 0;
  }

  const { count: bookingCount } = await supabase
    .from('reservations')
    .select('id', { count: 'exact', head: true })
    .not('status', 'in', '("CANCELLED","EXPIRED")');
  const hasBooking = (bookingCount ?? 0) > 0;

  const isPublished = Boolean(facility.is_published);
  const canPublish = hasActiveField && hasAvailability;

  let state: ActivationState;
  if (hasBooking) state = 'ACTIVATED';
  else if (isPublished) state = 'PUBLISHED';
  else if (canPublish) state = 'BOOKABLE_READY';
  else state = 'FACILITY_CREATED';

  return {
    state,
    facilityId: facility.id as string,
    slug: (facility.slug as string | null) ?? null,
    hasFacility: true,
    hasActiveField,
    hasAvailability,
    isPublished,
    hasBooking,
    canPublish,
  };
}
