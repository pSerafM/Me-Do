import type { DadosServicoCobranca, EstrategiaCobranca } from "./EstrategiaCobranca";

// Estratégia padrão: mantém a regra original e cobra exatamente o preço cadastrado.
export class CobrancaPrecoFixo implements EstrategiaCobranca {
    // Identificador persistido; o backend também reconhece esse mesmo valor.
    readonly tipo = "preco_fixo";
    // Rótulo usado para explicar a escolha ao usuário.
    readonly nome = "Preço fixo";

    // Exemplo: serviço cadastrado por 80 reais continua custando 80 reais.
    calcular(servico: DadosServicoCobranca): number {
        return servico.valor;
    }
}
