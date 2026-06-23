'use server';

import { createClient } from '../lib/supabase/server';
import type { FieldType } from '../lib/domain';

/**
 * Catálogo público del marketplace. Lee SOLO a través de funciones
 * SECURITY DEFINER (`public_*`), nunca de las tablas del dueño: así el lado
 * cliente no toca la RLS multi-tenant. Funcionan para visitantes anónimos.
 */

export interface PublicFacilityCard {
  id: string;
  slug: string;
  name: string;
  district: string | null;
  address: string | null;
  description: string | null;
  fieldCount: number;
  minPrice: number | null;
  amenities: string[];
}

export interface PublicField {
  id: string;
  name: string;
  type: FieldType;
  pricePerHour: number;
}

export interface PublicFacility {
  id: string;
  slug: string;
  name: string;
  district: string | null;
  address: string | null;
  phone: string | null;
  description: string | null;
  depositPercentage: number;
  amenities: string[];
  fields: PublicField[];
}

export interface Slot {
  start: string;
  end: string;
  pricePerHour: number;
  available: boolean;
}

export async function getPublicFacilities(): Promise<PublicFacilityCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('public_facilities');
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    district: (r.district as string) ?? null,
    address: (r.address as string) ?? null,
    description: (r.description as string) ?? null,
    fieldCount: Number(r.field_count ?? 0),
    minPrice: r.min_price == null ? null : Number(r.min_price),
    amenities: (r.amenities as string[]) ?? [],
  }));
}

export async function getPublicFacility(slug: string): Promise<PublicFacility | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('public_facility', { p_slug: slug });
  if (error || !data) return null;
  const f = data as Record<string, unknown>;
  return {
    id: String(f.id),
    slug: String(f.slug),
    name: String(f.name),
    district: (f.district as string) ?? null,
    address: (f.address as string) ?? null,
    phone: (f.phone as string) ?? null,
    description: (f.description as string) ?? null,
    depositPercentage: Number(f.deposit_percentage ?? 30),
    amenities: (f.amenities as string[]) ?? [],
    fields: ((f.fields as Record<string, unknown>[]) ?? []).map((fl) => ({
      id: String(fl.id),
      name: String(fl.name),
      type: fl.type as FieldType,
      pricePerHour: Number(fl.price_per_hour),
    })),
  };
}

/** Slots de 30 min de una cancha en una fecha local (YYYY-MM-DD). */
export async function getFieldSlots(fieldId: string, date: string): Promise<Slot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('public_field_slots', {
    p_field_id: fieldId,
    p_date: date,
  });
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((s) => ({
    start: String(s.slot_start),
    end: String(s.slot_end),
    pricePerHour: Number(s.price_per_hour),
    available: Boolean(s.available),
  }));
}
