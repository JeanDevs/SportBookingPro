'use server';

import { createClient } from '../lib/supabase/server';

/**
 * Capa de acceso a `facilities` (el complejo deportivo del propietario).
 *
 * MVP: un solo complejo por propietario. Todo acceso pasa por el server client
 * (`@supabase/ssr`, cookies httpOnly) y queda aislado por RLS: las policies
 * `facilities_*_own` filtran por `owner_id = auth.uid()`, asi que un propietario
 * jamas ve ni toca el complejo de otro.
 */

export type FacilityStatus = 'ACTIVE' | 'INACTIVE';

export interface Facility {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  timezone: string;
  status: FacilityStatus;
}

export interface CreateFacilityInput {
  name: string;
  phone?: string;
  address?: string;
}

export interface FacilityResult {
  error: string | null;
}

const FACILITY_COLUMNS = 'id, name, phone, address, timezone, status';

/**
 * Devuelve el complejo del propietario autenticado, o `null` si todavia no ha
 * creado ninguno (estado que dispara el gate de onboarding). RLS garantiza que
 * solo puede devolver un complejo propio.
 */
export async function getMyFacility(): Promise<Facility | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('facilities')
    .select(FACILITY_COLUMNS)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Facility;
}

/**
 * Crea el complejo del propietario. `owner_id` se fija explicitamente al usuario
 * autenticado porque la tabla no tiene default y la policy de insert exige
 * `owner_id = auth.uid()`. El resto de campos toma los defaults del schema
 * (timezone America/Lima, status ACTIVE, deposito 30%, etc.).
 */
export async function createFacility({
  name,
  phone,
  address,
}: CreateFacilityInput): Promise<FacilityResult> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { error: 'El nombre del complejo es obligatorio.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sesion no valida. Inicia sesion de nuevo.' };
  }

  const { error } = await supabase.from('facilities').insert({
    owner_id: user.id,
    name: trimmedName,
    phone: phone?.trim() || null,
    address: address?.trim() || null,
  });

  if (error) {
    return { error: 'No se pudo crear el complejo.' };
  }

  return { error: null };
}

/**
 * Actualiza datos editables del complejo del propietario. RLS limita el update
 * al complejo propio; no hace falta filtrar por `owner_id` en la query.
 */
export async function updateFacility(
  id: string,
  input: Partial<CreateFacilityInput>,
): Promise<FacilityResult> {
  const patch: Record<string, string | null> = {};

  if (input.name !== undefined) {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      return { error: 'El nombre del complejo es obligatorio.' };
    }
    patch.name = trimmedName;
  }
  if (input.phone !== undefined) {
    patch.phone = input.phone.trim() || null;
  }
  if (input.address !== undefined) {
    patch.address = input.address.trim() || null;
  }

  if (Object.keys(patch).length === 0) {
    return { error: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('facilities').update(patch).eq('id', id);

  if (error) {
    return { error: 'No se pudo actualizar el complejo.' };
  }

  return { error: null };
}
