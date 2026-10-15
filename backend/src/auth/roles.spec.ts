import { describe, expect, it } from 'vitest';
import { PERMISSOES, temPermissao } from './roles.js';

describe('permissões por cargo', () => {
  it('allows every role to use checkout, invoices, and cancellation', () => {
    for (const cargo of ['Atendente', 'Prestador', 'Gestor', 'Dono'] as const) {
      expect(temPermissao(cargo, PERMISSOES.checkout)).toBe(true);
      expect(temPermissao(cargo, PERMISSOES.notasFiscais)).toBe(true);
      expect(temPermissao(cargo, PERMISSOES.pedidosCancelar)).toBe(true);
    }
  });

  it('grants order operations and logs to Prestador and higher roles', () => {
    expect(temPermissao('Atendente', PERMISSOES.pedidosOperar)).toBe(false);
    expect(temPermissao('Prestador', PERMISSOES.pedidosOperar)).toBe(true);
    expect(temPermissao('Prestador', PERMISSOES.pedidosVerLog)).toBe(true);
    expect(temPermissao('Prestador', PERMISSOES.estoqueConsultar)).toBe(true);
    expect(temPermissao('Prestador', PERMISSOES.estoqueGerenciar)).toBe(false);
  });

  it('grants management from Gestor and role assignment only to Dono', () => {
    expect(temPermissao('Prestador', PERMISSOES.estoqueGerenciar)).toBe(false);
    expect(temPermissao('Gestor', PERMISSOES.estoqueGerenciar)).toBe(true);
    expect(temPermissao('Gestor', PERMISSOES.funcionariosGerenciar)).toBe(true);
    expect(temPermissao('Gestor', PERMISSOES.cargosAtribuir)).toBe(false);
    expect(temPermissao('Dono', PERMISSOES.cargosAtribuir)).toBe(true);
    expect(temPermissao('Dono', PERMISSOES.servicosGerenciar)).toBe(true);
    expect(temPermissao('Dono', PERMISSOES.visaoFinanceira)).toBe(true);
  });
});
