// Ainda não é instanciada
// Representa a tabela pedido_serviço planejada (servico, pedido e valor cobrado).

export class ItemServico {
    idServico: number;
    idPedido: number;
    valorCobrado: number;

    constructor(
        idServico: number,
        idPedido: number,
        valorCobrado: number
    ) {
        this.idServico = idServico;
        this.idPedido = idPedido;
        this.valorCobrado = valorCobrado;
    }

    atualizarValor(novoValor: number): void {
        this.valorCobrado = novoValor;
    }

    exibirDados(): string {
        return `Serviço #${this.idServico} - Pedido #${this.idPedido} - R$ ${this.valorCobrado.toFixed(2)}`;
    }
}