export const CARGOS = ['Atendente', 'Prestador', 'Gestor', 'Dono'] as const;
/** União literal dos cargos válidos; evita usar nomes de cargo arbitrários no código. */
export type Cargo = (typeof CARGOS)[number];

/** Identificadores únicos de capacidades protegidas por autorização. */
export const PERMISSOES = {
  clientesGerenciar: 'clientes.gerenciar',
  pedidosConsultar: 'pedidos.consultar',
  pedidosCriar: 'pedidos.criar',
  pedidosOperar: 'pedidos.operar',
  pedidosCancelar: 'pedidos.cancelar',
  pedidosVerLog: 'pedidos.ver-log',
  comunicarCliente: 'cliente.comunicar',
  checkout: 'checkout',
  notasFiscais: 'notas-fiscais',
  despesasGerenciar: 'despesas.gerenciar',
  estoqueConsultar: 'estoque.consultar',
  estoqueGerenciar: 'estoque.gerenciar',
  funcionariosGerenciar: 'funcionarios.gerenciar',
  cargosAtribuir: 'cargos.atribuir',
  servicosGerenciar: 'servicos.gerenciar',
  visaoFinanceira: 'financeiro.visualizar',
} as const;

export type Permissao = (typeof PERMISSOES)[keyof typeof PERMISSOES];

// A ordem define a hierarquia: cargos posteriores herdam permissões dos cargos anteriores.
const HIERARQUIA: readonly Cargo[] = CARGOS;

// Centraliza o cargo mínimo exigido por cada capacidade; editar esta tabela altera a política.
const CARGO_MINIMO_POR_PERMISSAO: Record<Permissao, Cargo> = {
  [PERMISSOES.clientesGerenciar]: 'Atendente',
  [PERMISSOES.pedidosConsultar]: 'Atendente',
  [PERMISSOES.pedidosCriar]: 'Atendente',
  [PERMISSOES.pedidosOperar]: 'Prestador',
  [PERMISSOES.pedidosCancelar]: 'Atendente',
  [PERMISSOES.pedidosVerLog]: 'Prestador',
  [PERMISSOES.comunicarCliente]: 'Prestador',
  [PERMISSOES.checkout]: 'Atendente',
  [PERMISSOES.notasFiscais]: 'Atendente',
  [PERMISSOES.despesasGerenciar]: 'Gestor',
  [PERMISSOES.estoqueConsultar]: 'Prestador',
  [PERMISSOES.estoqueGerenciar]: 'Gestor',
  [PERMISSOES.funcionariosGerenciar]: 'Gestor',
  [PERMISSOES.cargosAtribuir]: 'Dono',
  [PERMISSOES.servicosGerenciar]: 'Dono',
  [PERMISSOES.visaoFinanceira]: 'Dono',
};

export function isCargo(value: unknown): value is Cargo {
  return typeof value === 'string' && CARGOS.some((cargo) => cargo === value);
}

export function temPermissao(cargo: Cargo, permissao: Permissao): boolean {
  // Cargo é suficiente quando está no mesmo nível ou acima do cargo mínimo configurado.
  return HIERARQUIA.indexOf(cargo) >= HIERARQUIA.indexOf(CARGO_MINIMO_POR_PERMISSAO[permissao]);
}
