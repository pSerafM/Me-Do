import { Pedido } from "../models/Pedido";

export abstract class ProcessarPedido {
    processar(pedido: Pedido): Pedido {
        this.validar(pedido);
        this.calcularValor(pedido);
        this.aplicarRegras(pedido);
        this.finalizarProcessamento(pedido);

        return pedido;
    }

    protected validar(pedido: Pedido): void {
        if (!pedido.cliente || !pedido.servico) {
            throw new Error("Pedido inválido.");
        }
    }

    protected calcularValor(pedido: Pedido): void {
        pedido.valorTotal = pedido.servico.calcularValor();
    }

    protected abstract aplicarRegras(pedido: Pedido): void;

    protected finalizarProcessamento(pedido: Pedido): void {
        pedido.alterarStatus("processando");
    }
}
