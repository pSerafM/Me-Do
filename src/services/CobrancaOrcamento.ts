import type { DadosServicoCobranca, EstrategiaCobranca } from "./EstrategiaCobranca";

// Estratégia cujo preço final é decidido pelo técnico durante o atendimento.
export class CobrancaOrcamento implements EstrategiaCobranca {
    // Identificador usado pela API e pelo banco para reconhecer esta modalidade.
    readonly tipo = "orcamento";
    readonly nome = "Orçamento";
    // Fica vazio até o técnico informar um preço final.
    private valorDefinido?: number;

    // Disponibiliza o valor para a tela e para a serialização do modelo.
    get valorOrcado(): number | undefined {
        return this.valorDefinido;
    }

    // Permitir omitir o orçamento mantém o valor cadastrado como estimativa inicial.
    constructor(valorDefinido?: number) {
        this.definirValor(valorDefinido);
    }

    // Um orçamento negativo ou não numérico não representa um preço válido.
    definirValor(valor: number | undefined): void {
        if (valor !== undefined && (!Number.isFinite(valor) || valor < 0)) {
            throw new RangeError("O valor do orçamento deve ser um número maior ou igual a zero.");
        }
        this.valorDefinido = valor;
    }

    // Antes da decisão do técnico usa o preço cadastrado; depois usa o orçamento.
    calcular(servico: DadosServicoCobranca): number {
        return this.valorDefinido ?? servico.valor;
    }
}
