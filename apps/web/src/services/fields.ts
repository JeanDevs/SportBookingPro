'use server';

import { createClient } from '../lib/supabase/server';
import { getMyFacility } from './facilities';

/**
 * Capa de acceso a `fields` (canchas) del complejo del propietario.
 *
 * Todo pasa por el server client (cookies httpOnly) y queda aislado por RLS:
 * las policies `fields_*_own` filtran por `owner_id = auth.uid()`. El soft delete
 * se modela con el enum `status`: "desactivar" = `INACTIVE` (la fila nunca se
 * borra). `MAINTENANCE` queda disponible para canchas temporalmente fuera de uso.
 */

export type FieldType =
  | 'FUTBOL_5'
  | 'FUTBOL_6'
  | 'FUTBOL_7'
  | 'FUTBOL_8'
  | 'FUTBOL_11'
  | 'VOLEY'
  | 'TENNIS'
  | 'OTHER';

export type FieldStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface Field {
  id: string;
  facilityId: string;
  name: string;
  type: FieldType;
  pricePerHour: number;
  status: FieldStatus;
}

export interface CreateFieldInput {
  name: string;
  type: FieldType;
  pricePerHour: number;
}

export interface UpdateFieldInput {
  name?: string;
  type?: FieldType;
  pricePerHour?: number;
}

export interface FieldResult {
  error: string | null;
}

interface FieldRow {
  id: string;
  facility_id: string;
  name: string;
  type: FieldType;
  price_per_hour: number | string;
  status: FieldStatus;
}

const FIELD_COLUMNS = 'id, facility_id, name, type, price_per_hour, status';

function mapRow(row: FieldRow): Field {
  return {
    id: row.id,
    facilityId: row.facility_id,
    name: row.name,
    type: row.type,
    // `numeric` puede llegar como string desde PostgREST; normalizamos a number.
    pricePerHour: Number(row.price_per_hour),
    status: row.status,
  };
}

function validateFieldInput(input: UpdateFieldInput): string | null {
  if (input.name !== undefined && !input.name.trim()) {
    return 'El nombre de la cancha es obligatorio.';
  }
  if (
    input.pricePerHour !== undefined &&
    (!Number.isFinite(input.pricePerHour) || input.pricePerHour < 0)
  ) {
    return 'La tarifa por hora debe ser un numero mayor o igual a 0.';
  }
  return null;
}

/**
 * Lista las canchas del complejo del propietario, mas recientes al final.
 * Devuelve `[]` ante cualquier error o si aun no hay canchas.
 */
export async function listFields(): Promise<Field[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('fields')
    .select(FIELD_COLUMNS)
    .order('created_at', { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as FieldRow[]).map(mapRow);
}

/**
 * Crea una cancha en el complejo del propietario. Fija `owner_id` y `facility_id`
 * explicitamente: el primero porque la policy de insert exige
 * `owner_id = auth.uid()`, el segundo porque la cancha cuelga del unico complejo
 * del propietario (MVP de un solo complejo).
 */
export async function createField(input: CreateFieldInput): Promise<FieldResult> {
  const validationError = validateFieldInput(input);
  if (validationError) {
    return { error: validationError };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sesion no valida. Inicia sesion de nuevo.' };
  }

  const facility = await getMyFacility();
  if (!facility) {
    return { error: 'Primero debes crear tu complejo.' };
  }

  const { error } = await supabase.from('fields').insert({
    owner_id: user.id,
    facility_id: facility.id,
    name: input.name.trim(),
    type: input.type,
    price_per_hour: input.pricePerHour,
  });

  if (error) {
    return { error: 'No se pudo crear la cancha.' };
  }

  return { error: null };
}

/**
 * Actualiza datos editables de una cancha (nombre, tipo, tarifa). RLS limita el
 * update a canchas propias.
 */
export async function updateField(
  id: string,
  input: UpdateFieldInput,
): Promise<FieldResult> {
  const validationError = validateFieldInput(input);
  if (validationError) {
    return { error: validationError };
  }

  const patch: Record<string, string | number> = {};
  if (input.name !== undefined) {
    patch.name = input.name.trim();
  }
  if (input.type !== undefined) {
    patch.type = input.type;
  }
  if (input.pricePerHour !== undefined) {
    patch.price_per_hour = input.pricePerHour;
  }

  if (Object.keys(patch).length === 0) {
    return { error: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('fields').update(patch).eq('id', id);

  if (error) {
    return { error: 'No se pudo actualizar la cancha.' };
  }

  return { error: null };
}

/**
 * Cambia el estado de una cancha. Es el mecanismo de soft delete: `INACTIVE`
 * desactiva sin borrar; `MAINTENANCE` la marca temporalmente fuera de uso;
 * `ACTIVE` la reactiva. RLS limita el cambio a canchas propias.
 */
export async function setFieldStatus(
  id: string,
  status: FieldStatus,
): Promise<FieldResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('fields').update({ status }).eq('id', id);

  if (error) {
    return { error: 'No se pudo cambiar el estado de la cancha.' };
  }

  return { error: null };
}
