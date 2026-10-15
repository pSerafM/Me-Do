export type TipoCobranca = 'preco_fixo' | 'hora_tecnica' | 'orcamento';
export type TipoProcessamento = 'comum' | 'urgente' | 'garantia';

// Valores carregados diretamente do cadastro do serviço no MySQL.
export interface DadosServicoCobranca {
  valor: number;
  horasEstimadas: number;
}

// A API calcula o preço oficial; valores enviados pelo navegador nunca são considerados confiáveis.
export function calcularValorCobranca(
  servico: DadosServicoCobranca,
  tipo: TipoCobranca,
  valorOrcado?: number | null,
): number {
  // O servidor escolhe a fórmula com base no tipo validado pelo DTO.
  // Se ainda não houver orçamento, usa o valor cadastrado como estimativa.
  const valor =
    tipo === 'hora_tecnica'
      ? servico.valor * servico.horasEstimadas
      : tipo === 'orcamento'
        ? valorOrcado ?? servico.valor
        : servico.valor;
  // Arredonda em centavos antes de persistir em DECIMAL(12,2).
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

// Mantém no banco o status que corresponde à estratégia de processamento selecionada.
export function statusDoProcessamento(tipo: TipoProcessamento): string {
  switch (tipo) {
    case 'urgente':
      return 'urgente';
    case 'garantia':
      return 'garantia';
    case 'comum':
      return 'aprovado';
  }
}
