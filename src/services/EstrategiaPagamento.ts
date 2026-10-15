import type { FormaPagamento } from "../context/AppContext";

// Strategy: contrato comum. Cada forma de pagamento implementa suas próprias regras.
export interface EstrategiaPagamento {
    readonly rotulo: string;
    // Regra específica da forma; lança Error se o valor não for aceito.
    validar(valor: number): void;
    // Texto de exibição do pagamento.
    descrever(valor: number): string;
}

class PagamentoPix implements EstrategiaPagamento {
    readonly rotulo = "Pix";

    validar(_valor: number): void {
        // Sem regra extra: qualquer valor positivo é aceito.
    }

    descrever(valor: number): string {
        return `R$ ${valor.toFixed(2)} via Pix`;
    }
}

class PagamentoDebito implements EstrategiaPagamento {
    readonly rotulo = "Débito";

    validar(_valor: number): void {
        // Sem regra extra: qualquer valor positivo é aceito.
    }

    descrever(valor: number): string {
        return `R$ ${valor.toFixed(2)} no débito`;
    }
}

class PagamentoCredito implements EstrategiaPagamento {
    readonly rotulo = "Crédito";
    private readonly valorMinimo = 10;

    validar(valor: number): void {
        // Regra do crédito: exige um valor mínimo.
        if (valor < this.valorMinimo) {
            throw new Error(`No crédito, o valor mínimo é R$ ${this.valorMinimo.toFixed(2)}.`);
        }
    }

    descrever(valor: number): string {
        return `R$ ${valor.toFixed(2)} no crédito`;
    }
}

class PagamentoDinheiro implements EstrategiaPagamento {
    readonly rotulo = "Dinheiro";
    private readonly valorMaximo = 5000;

    validar(valor: number): void {
        // Regra do dinheiro: limita o valor recebido em espécie.
        if (valor > this.valorMaximo) {
            throw new Error(`Em dinheiro, o valor máximo é R$ ${this.valorMaximo.toFixed(2)}.`);
        }
    }

    descrever(valor: number): string {
        return `R$ ${valor.toFixed(2)} em dinheiro`;
    }
}

// Tabela forma -> estratégia. Para criar uma nova forma, basta uma nova classe e uma linha aqui.
export const ESTRATEGIAS: Record<FormaPagamento, EstrategiaPagamento> = {
    pix: new PagamentoPix(),
    credito: new PagamentoCredito(),
    debito: new PagamentoDebito(),
    dinheiro: new PagamentoDinheiro()
};

export function obterEstrategia(forma: string): EstrategiaPagamento {
    const estrategia = ESTRATEGIAS[forma as FormaPagamento];

    if (!estrategia) {
        throw new Error("Forma de pagamento inválida.");
    }

    return estrategia;
}