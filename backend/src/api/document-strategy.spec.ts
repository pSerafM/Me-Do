import { describe, expect, it } from 'vitest';
import { validateSync } from 'class-validator';
import { ClienteDto } from './api.dto.js';
import { isValidCpfCnpj } from './document-strategy.js';

describe('CPF/CNPJ strategies', () => {
  it.each([
    ['529.982.247-25', true],
    ['04.252.011/0001-10', true],
    ['529.982.247-24', false],
    ['04.252.011/0001-11', false],
    ['111.111.111-11', false],
    ['11.111.111/1111-11', false],
    ['1234567890', false],
    ['529.982.247-X25', false],
  ])('validates %s as %s', (document, expected) => {
    expect(isValidCpfCnpj(document)).toBe(expected);
  });

  it('applies document validation to the client API DTO', () => {
    const validClient = Object.assign(new ClienteDto(), {
      nome: 'Cliente',
      cpfCnpj: '529.982.247-25',
      telefone: '11999999999',
    });
    const invalidClient = Object.assign(new ClienteDto(), {
      nome: 'Cliente',
      cpfCnpj: '529.982.247-24',
      telefone: '11999999999',
    });

    expect(validateSync(validClient)).toHaveLength(0);
    expect(validateSync(invalidClient).some((error) => error.property === 'cpfCnpj')).toBe(true);
  });
});
