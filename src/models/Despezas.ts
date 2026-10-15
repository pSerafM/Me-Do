export class Despesa {
    idDespesa: number;
    descricao: string;
    valor: number;
    data: Date;
    status: string;

    constructor(
        idDespesa: number,
        descricao: string,
        valor: number,
        data: Date,
        status: string
    ) {
        this.idDespesa = idDespesa;
        this.descricao = descricao;
        this.valor = valor;
        this.data = data;
        this.status = status;
    }

    atualizarValor(novoValor: number): void {
        this.valor = novoValor;
    }

    pagar(): void {
        // Atualiza o status da despesa para "paga" quando o pagamento é realizado.
        this.status = "paga";
    }

    exibirDados(): string {
        return `${this.descricao} - R$ ${this.valor.toFixed(2)} - ${this.status}`;
    }
}   