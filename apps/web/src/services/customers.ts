'use server';

import { createClient } from '../lib/supabase/server';

/**
 * Capa de acceso a `customers` (clientes del propietario).
 *
 * Todo pasa por el server client (cookies httpOnly) y queda aislado por RLS:
 * las policies `customers_*_own` filtran por `owner_id = auth.uid()`. El borrado
 * es soft (archivar): `is_active = false` oculta al cliente sin perder su
 * historial de reservas/pagos.
 */

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  isActive: boolean;
}

export interface CreateCustomerInput {
  name: string;
  phone?: string;
  notes?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string;
  notes?: string;
}

export interface CustomerResult {
  error: string | null;
}

interface CustomerRow {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  is_active: boolean;
}

const CUSTOMER_COLUMNS = 'id, name, phone, notes, is_active';

// Codigo de violacion de unique constraint en PostgreSQL (owner_id, phone).
const UNIQUE_VIOLATION = '23505';

function mapRow(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    notes: row.notes,
    isActive: row.is_active,
  };
}

/**
 * Lista los clientes del propietario, ordenados por nombre. Por defecto solo los
 * activos; `includeArchived` los trae todos (para una vista de archivados).
 */
export async function listCustomers(includeArchived = false): Promise<Customer[]> {
  const supabase = await createClient();

  let query = supabase.from('customers').select(CUSTOMER_COLUMNS);
  if (!includeArchived) {
    query = query.eq('is_active', true);
  }
  const { data, error } = await query.order('name', { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as CustomerRow[]).map(mapRow);
}

/**
 * Crea un cliente. `owner_id` se fija al usuario autenticado (la policy de insert
 * lo exige). Un telefono duplicado para el mismo propietario viola el unique
 * parcial `customers_owner_phone_unique` y se traduce a un error legible.
 */
export async function createCustomer({
  name,
  phone,
  notes,
}: CreateCustomerInput): Promise<CustomerResult> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { error: 'El nombre del cliente es obligatorio.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sesion no valida. Inicia sesion de nuevo.' };
  }

  const { error } = await supabase.from('customers').insert({
    owner_id: user.id,
    name: trimmedName,
    phone: phone?.trim() || null,
    notes: notes?.trim() || null,
  });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { error: 'Ya existe un cliente con ese telefono.' };
    }
    return { error: 'No se pudo crear el cliente.' };
  }

  return { error: null };
}

/**
 * Actualiza datos editables de un cliente. RLS limita el update a clientes
 * propios. Tambien maneja el telefono duplicado.
 */
export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput,
): Promise<CustomerResult> {
  const patch: Record<string, string | null> = {};

  if (input.name !== undefined) {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      return { error: 'El nombre del cliente es obligatorio.' };
    }
    patch.name = trimmedName;
  }
  if (input.phone !== undefined) {
    patch.phone = input.phone.trim() || null;
  }
  if (input.notes !== undefined) {
    patch.notes = input.notes.trim() || null;
  }

  if (Object.keys(patch).length === 0) {
    return { error: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('customers').update(patch).eq('id', id);

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { error: 'Ya existe un cliente con ese telefono.' };
    }
    return { error: 'No se pudo actualizar el cliente.' };
  }

  return { error: null };
}

/**
 * Archiva o restaura un cliente (soft delete). `isActive = false` lo saca de la
 * lista activa preservando su historial; `true` lo restaura. RLS limita el
 * cambio a clientes propios.
 */
export async function setCustomerActive(
  id: string,
  isActive: boolean,
): Promise<CustomerResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('customers')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    return { error: 'No se pudo cambiar el estado del cliente.' };
  }

  return { error: null };
}
