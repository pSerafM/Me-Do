export const CARGOS = ['Atendente', 'Prestador', 'Gestor', 'Dono'] as const;
export type Cargo = (typeof CARGOS)[number];

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

const HIERARQUIA: readonly Cargo[] = CARGOS;

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
  return HIERARQUIA.indexOf(cargo) >= HIERARQUIA.indexOf(CARGO_MINIMO_POR_PERMISSAO[permissao]);
}
