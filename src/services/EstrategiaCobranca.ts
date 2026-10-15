// Todas as formas de cobrança recebem os dados básicos do serviço e devolvem um valor.
export interface DadosServicoCobranca {
    valor: number;
    horasEstimadas: number;
}

export interface EstrategiaCobranca {
    readonly nome: string;
    calcular(servico: DadosServicoCobranca): number;
}
