export class ItemInsumo {
    idItemInsumo: number;
    idPedido: number;
    idInsumo: number;
    quantidadeUsada: number;
    valorUnitario: number;

    constructor(
        idItemInsumo: number,
        idPedido: number,
        idInsumo: number,
        quantidadeUsada: number,
        valorUnitario: number
    ) {
        this.idItemInsumo = idItemInsumo;
        this.idPedido = idPedido;
        this.idInsumo = idInsumo;
        this.quantidadeUsada = quantidadeUsada;
        this.valorUnitario = valorUnitario;
    }

    atualizarQuantidade(novaQuantidade: number): void {
        this.quantidadeUsada = novaQuantidade;
    }

    calcularValorTotal(): number {
        return this.quantidadeUsada * this.valorUnitario;
    }

    exibirDados(): string {
        return `Insumo #${this.idInsumo} - Pedido #${this.idPedido} - Quantidade: ${this.quantidadeUsada} - Total: R$ ${this.calcularValorTotal().toFixed(2)}`;
    }
}