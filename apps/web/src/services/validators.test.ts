import { describe, it, expect } from 'vitest';
import { validateFieldInput, validateCustomerName } from './validators';

describe('validateFieldInput', () => {
  it('acepta una cancha válida (nombre + tarifa)', () => {
    expect(validateFieldInput({ name: 'Cancha 1', pricePerHour: 120 })).toBeNull();
  });

  it('acepta tarifa 0 (cancha gratuita)', () => {
    expect(validateFieldInput({ name: 'Cancha', pricePerHour: 0 })).toBeNull();
  });

  it('rechaza nombre vacío o solo espacios', () => {
    expect(validateFieldInput({ name: '   ' })).toBe('El nombre de la cancha es obligatorio.');
    expect(validateFieldInput({ name: '' })).toBe('El nombre de la cancha es obligatorio.');
  });

  it('rechaza tarifa negativa', () => {
    expect(validateFieldInput({ pricePerHour: -1 })).toBe(
      'La tarifa por hora debe ser un numero mayor o igual a 0.',
    );
  });

  it('rechaza tarifa no finita (NaN)', () => {
    expect(validateFieldInput({ pricePerHour: Number.NaN })).toBe(
      'La tarifa por hora debe ser un numero mayor o igual a 0.',
    );
  });

  it('valida solo los campos presentes (edición parcial)', () => {
    // Editar solo el nombre: no debe exigir la tarifa.
    expect(validateFieldInput({ name: 'Nuevo nombre' })).toBeNull();
    // Editar solo la tarifa: no debe exigir el nombre.
    expect(validateFieldInput({ pricePerHour: 50 })).toBeNull();
    // Sin campos: nada que validar.
    expect(validateFieldInput({})).toBeNull();
  });
});

describe('validateCustomerName', () => {
  it('acepta un nombre válido', () => {
    expect(validateCustomerName('Carlos Mendoza')).toBeNull();
  });

  it('rechaza nombre vacío o solo espacios', () => {
    expect(validateCustomerName('')).toBe('El nombre del cliente es obligatorio.');
    expect(validateCustomerName('   ')).toBe('El nombre del cliente es obligatorio.');
  });
});
