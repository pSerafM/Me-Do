import type { DadosServicoCobranca, EstrategiaCobranca } from "./EstrategiaCobranca";

// Mantém a regra original: cobra o valor cadastrado para o serviço.
export class CobrancaPrecoFixo implements EstrategiaCobranca {
    readonly nome = "Preço fixo";

    calcular(servico: DadosServicoCobranca): number {
        return servico.valor;
    }
}
