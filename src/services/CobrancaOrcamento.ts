import type { DadosServicoCobranca, EstrategiaCobranca } from "./EstrategiaCobranca";

// Usa o preço informado pelo técnico ou, enquanto ele não definir um, o valor cadastrado.
export class CobrancaOrcamento implements EstrategiaCobranca {
    readonly nome = "Orçamento";
    private valorDefinido?: number;

    constructor(valorDefinido?: number) {
        this.definirValor(valorDefinido);
    }

    definirValor(valor: number | undefined): void {
        if (valor !== undefined && (!Number.isFinite(valor) || valor < 0)) {
            throw new RangeError("O valor do orçamento deve ser um número maior ou igual a zero.");
        }
        this.valorDefinido = valor;
    }

    calcular(servico: DadosServicoCobranca): number {
        return this.valorDefinido ?? servico.valor;
    }
}
