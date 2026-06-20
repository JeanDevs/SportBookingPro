/**
 * Validaciones puras compartidas por los servicios (fields, customers).
 *
 * Viven fuera de los módulos `'use server'` a propósito: un archivo de Server
 * Actions solo puede exportar funciones async, y estas son funciones síncronas
 * reutilizables. Mantenerlas aquí las hace testeables sin tocar Supabase y evita
 * duplicar las reglas en cada servicio.
 *
 * Convención: devuelven un mensaje de error legible (string) o `null` si la
 * entrada es válida.
 */

export interface FieldInputLike {
  name?: string;
  pricePerHour?: number;
}

/**
 * Valida nombre y/o tarifa de una cancha. Solo valida los campos presentes para
 * servir tanto a la creación (todos) como a la edición parcial (algunos).
 */
export function validateFieldInput(input: FieldInputLike): string | null {
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
 * Valida el nombre obligatorio de un cliente.
 */
export function validateCustomerName(name: string): string | null {
  if (!name.trim()) {
    return 'El nombre del cliente es obligatorio.';
  }
  return null;
}
