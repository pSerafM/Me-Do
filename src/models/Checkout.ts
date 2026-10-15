export class Checkout {
    // Um pedido pode ter vários registros de pagamento, por exemplo entrada e saldo final.
    idPedido: number;
    idFuncionario: number;
    valorPago: number;
    formaPagamento: string;
    dataPagamento: Date;

    constructor(
        idPedido: number,
        idFuncionario: number,
        valorPago: number,
        formaPagamento: string,
        dataPagamento: Date
    ) {
        this.idPedido = idPedido;
        this.idFuncionario = idFuncionario;
        this.valorPago = valorPago;
        this.formaPagamento = formaPagamento;
        this.dataPagamento = dataPagamento;
    }

    registrarPagamento(): void {
        // Validação local básica; o endpoint também valida valor e saldo antes de persistir.
        if (this.valorPago <= 0) {
            throw new Error("O valor do pagamento deve ser maior que zero.");
        }
    }

    alterarFormaPagamento(novaForma: string): void {
        this.formaPagamento = novaForma;
    }

    exibirDados(): string {
        return `Pedido #${this.idPedido} - R$ ${this.valorPago.toFixed(2)} - ${this.formaPagamento}`;
    }
}