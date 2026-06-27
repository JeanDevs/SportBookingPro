'use server';

import { createClient } from '../lib/supabase/server';
import { isAmenityKey, type FieldType } from '../lib/domain';

/**
 * Configuración del complejo (lado DUEÑO): datos públicos + publicación en el
 * marketplace + % de adelanto, y la DISPONIBILIDAD semanal por cancha (de la que
 * el portal deriva los slots reservables). Todo aislado por RLS.
 */

export interface FacilitySettings {
  id: string;
  name: string;
  slug: string | null;
  phone: string | null;
  address: string | null;
  district: string | null;
  description: string | null;
  isPublished: boolean;
  depositPercentage: number;
  holdMinutes: number;
  amenities: string[];
}

interface FacilityRow {
  id: string;
  name: string;
  slug: string | null;
  phone: string | null;
  address: string | null;
  district: string | null;
  description: string | null;
  is_published: boolean;
  deposit_percentage: number | string;
  reservation_intent_hold_minutes: number;
  amenities: string[] | null;
}

export async function getFacilitySettings(): Promise<FacilitySettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('facilities')
    .select(
      'id, name, slug, phone, address, district, description, is_published, deposit_percentage, reservation_intent_hold_minutes, amenities',
    )
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const f = data as FacilityRow;
  return {
    id: f.id,
    name: f.name,
    slug: f.slug,
    phone: f.phone,
    address: f.address,
    district: f.district,
    description: f.description,
    isPublished: f.is_published,
    depositPercentage: Number(f.deposit_percentage),
    holdMinutes: f.reservation_intent_hold_minutes,
    amenities: f.amenities ?? [],
  };
}

export interface UpdateFacilitySettingsInput {
  name?: string;
  phone?: string;
  address?: string;
  district?: string;
  description?: string;
  depositPercentage?: number;
  holdMinutes?: number;
  isPublished?: boolean;
  amenities?: string[];
}

export async function updateFacilitySettings(
  id: string,
  input: UpdateFacilitySettingsInput,
): Promise<{ error: string | null }> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) {
    if (!input.name.trim()) return { error: 'El nombre es obligatorio.' };
    patch.name = input.name.trim();
  }
  if (input.phone !== undefined) patch.phone = input.phone.trim() || null;
  if (input.address !== undefined) patch.address = input.address.trim() || null;
  if (input.district !== undefined) patch.district = input.district.trim() || null;
  if (input.description !== undefined) patch.description = input.description.trim() || null;
  if (input.depositPercentage !== undefined) {
    if (input.depositPercentage < 0 || input.depositPercentage > 100) {
      return { error: 'El adelanto debe estar entre 0 y 100%.' };
    }
    patch.deposit_percentage = input.depositPercentage;
  }
  if (input.holdMinutes !== undefined) {
    if (input.holdMinutes < 1 || input.holdMinutes > 120) {
      return { error: 'El bloqueo debe estar entre 1 y 120 minutos.' };
    }
    patch.reservation_intent_hold_minutes = input.holdMinutes;
  }
  if (input.isPublished !== undefined) patch.is_published = input.isPublished;
  if (input.amenities !== undefined) {
    // Solo keys del catálogo cerrado (defensa contra valores arbitrarios).
    patch.amenities = input.amenities.filter((a) => isAmenityKey(a));
  }

  if (Object.keys(patch).length === 0) return { error: null };

  const supabase = await createClient();
  const { error } = await supabase.from('facilities').update(patch).eq('id', id);
  if (error) return { error: 'No se pudo guardar la configuración.' };
  return { error: null };
}

export interface WeeklyWindow {
  dayOfWeek: number; // 0=Dom … 6=Sáb
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

export interface FieldAvailability {
  fieldId: string;
  fieldName: string;
  fieldType: FieldType;
  windows: WeeklyWindow[];
}

export async function getFieldsAvailability(): Promise<FieldAvailability[]> {
  const supabase = await createClient();
  const { data: fields } = await supabase
    .from('fields')
    .select('id, name, type')
    .eq('status', 'ACTIVE')
    .order('name', { ascending: true });
  if (!fields || fields.length === 0) return [];

  const fieldIds = fields.map((f) => f.id as string);
  const { data: rules } = await supabase
    .from('field_availability_rules')
    .select('field_id, day_of_week, start_time, end_time')
    .in('field_id', fieldIds)
    .eq('is_active', true);

  const byField = new Map<string, WeeklyWindow[]>();
  for (const r of (rules ?? []) as {
    field_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }[]) {
    const list = byField.get(r.field_id) ?? [];
    list.push({
      dayOfWeek: r.day_of_week,
      startTime: r.start_time.slice(0, 5),
      endTime: r.end_time.slice(0, 5),
    });
    byField.set(r.field_id, list);
  }

  return (fields as { id: string; name: string; type: FieldType }[]).map((f) => ({
    fieldId: f.id,
    fieldName: f.name,
    fieldType: f.type,
    windows: byField.get(f.id) ?? [],
  }));
}

/** Horario por defecto sugerido al crear una cancha: todos los días 08:00–23:00.
 * Hace que la cancha sea inmediatamente reservable (evita el dead-end de 0 slots).
 * Idempotente: solo siembra si la cancha aún no tiene reglas de disponibilidad. */
export async function applyDefaultWeeklyAvailability(
  fieldId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('field_availability_rules')
    .select('id')
    .eq('field_id', fieldId)
    .limit(1);
  if ((existing ?? []).length > 0) return { error: null };

  const windows: WeeklyWindow[] = Array.from({ length: 7 }, (_, dow) => ({
    dayOfWeek: dow,
    startTime: '08:00',
    endTime: '23:00',
  }));
  return setFieldAvailability(fieldId, windows);
}

/** Publica el complejo en el marketplace tras validar precondiciones: debe tener
 * al menos una cancha ACTIVA con disponibilidad configurada; de lo contrario
 * aparecería sin slots reservables. Devuelve un error legible si aún no califica. */
export async function publishFacility(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: fields } = await supabase.from('fields').select('id').eq('status', 'ACTIVE');
  const activeIds = (fields ?? []).map((f) => f.id as string);
  if (activeIds.length === 0) {
    return { error: 'Agrega al menos una cancha activa antes de publicar.' };
  }

  const { data: rules } = await supabase
    .from('field_availability_rules')
    .select('field_id')
    .in('field_id', activeIds)
    .eq('is_active', true)
    .limit(1);
  if ((rules ?? []).length === 0) {
    return { error: 'Configura los horarios de al menos una cancha antes de publicar.' };
  }

  const { error } = await supabase.from('facilities').update({ is_published: true }).eq('id', id);
  if (error) return { error: 'No se pudo publicar el complejo.' };
  return { error: null };
}

/** Quita el complejo del marketplace (sigue existiendo y operando en el panel). */
export async function unpublishFacility(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from('facilities').update({ is_published: false }).eq('id', id);
  if (error) return { error: 'No se pudo despublicar el complejo.' };
  return { error: null };
}

/** Reemplaza la disponibilidad semanal de una cancha (borra + inserta). */
export async function setFieldAvailability(
  fieldId: string,
  windows: WeeklyWindow[],
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesión no válida.' };

  for (const w of windows) {
    if (w.startTime >= w.endTime) {
      return { error: 'En cada día, la hora de apertura debe ser menor a la de cierre.' };
    }
  }

  const { error: delErr } = await supabase
    .from('field_availability_rules')
    .delete()
    .eq('field_id', fieldId);
  if (delErr) return { error: 'No se pudo actualizar el horario.' };

  if (windows.length > 0) {
    const { error: insErr } = await supabase.from('field_availability_rules').insert(
      windows.map((w) => ({
        owner_id: user.id,
        field_id: fieldId,
        day_of_week: w.dayOfWeek,
        start_time: w.startTime,
        end_time: w.endTime,
        is_active: true,
      })),
    );
    if (insErr) return { error: 'No se pudo guardar el horario (revisa los rangos).' };
  }

  return { error: null };
}
