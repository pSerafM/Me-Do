import { describe, expect, it } from 'vitest';
import { calcularValorCobranca, statusDoProcessamento } from './order-strategies.js';

describe('estratégias de cobrança no servidor', () => {
  // Exemplo comum usado para testar todas as modalidades com a mesma entrada.
  const servico = { valor: 80, horasEstimadas: 2.5 };

  it('usa o valor cadastrado para preço fixo', () => {
    expect(calcularValorCobranca(servico, 'preco_fixo')).toBe(80);
  });

  it('multiplica o valor por hora pelas horas estimadas', () => {
    expect(calcularValorCobranca(servico, 'hora_tecnica')).toBe(200);
  });

  it('usa o orçamento informado ou o valor cadastrado como alternativa', () => {
    expect(calcularValorCobranca(servico, 'orcamento', 125.5)).toBe(125.5);
    expect(calcularValorCobranca(servico, 'orcamento', null)).toBe(80);
  });
});

describe('estratégias de processamento', () => {
  // Cada opção deve produzir o status combinado para aquela regra de processamento.
  it.each([
    ['comum', 'aprovado'],
    ['urgente', 'urgente'],
    ['garantia', 'garantia'],
  ] as const)('mapeia %s para o status %s', (tipo, status) => {
    expect(statusDoProcessamento(tipo)).toBe(status);
  });
});
