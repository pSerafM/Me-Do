// Dados comuns que qualquer estratégia precisa para calcular o preço de um serviço.
export interface DadosServicoCobranca {
    valor: number;
    horasEstimadas: number;
}

// Contrato compartilhado: Servico só conhece esta interface e pode trocar a regra
// sem precisar conhecer as classes concretas de cobrança.
export interface EstrategiaCobranca {
    // Código salvo pela API para reconstruir a estratégia quando o pedido é lido.
    readonly tipo: TipoCobranca;
    // Nome amigável que pode ser apresentado na interface.
    readonly nome: string;
    // Só a estratégia de orçamento possui um valor digitado pelo técnico.
    readonly valorOrcado?: number;
    // Recebe os dados do serviço e devolve o valor calculado por esta regra.
    calcular(servico: DadosServicoCobranca): number;
}

// Valores aceitos pela interface, pelo contrato HTTP e pelo enum do banco.
export type TipoCobranca = "preco_fixo" | "hora_tecnica" | "orcamento";
