import { obterEstrategia } from "../services/EstrategiaPagamento";
export class Checkout {
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
        if (this.valorPago <= 0) {
            throw new Error("O valor do pagamento deve ser maior que zero.");
        }
        // Strategy: a regra específica depende da forma de pagamento escolhida.
        obterEstrategia(this.formaPagamento).validar(this.valorPago);
    }

    alterarFormaPagamento(novaForma: string): void {
        obterEstrategia(novaForma);
        this.formaPagamento = novaForma;
    }

    exibirDados(): string {
        return `Pedido #${this.idPedido} - ${obterEstrategia(this.formaPagamento).descrever(this.valorPago)}`;
    }
}