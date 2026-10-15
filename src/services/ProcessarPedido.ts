import { Pedido } from "../models/Pedido";
import { ProcessarPedidoComum } from "./ProcessarPedidoComum";
import type { EstrategiaProcessamentoPedido } from "./EstrategiaProcessamentoPedido";

// Este contexto cuida do que é igual para todos os processamentos.
export class ProcessarPedido {
    private estrategia: EstrategiaProcessamentoPedido;

    constructor(estrategia: EstrategiaProcessamentoPedido = new ProcessarPedidoComum()) {
        // Se não for informada uma estratégia, o pedido será processado como comum.
        this.estrategia = estrategia;
    }

    // A estratégia pode ser trocada sem criar outro pedido.
    definirEstrategia(estrategia: EstrategiaProcessamentoPedido): void {
        this.estrategia = estrategia;
    }

    processar(pedido: Pedido): Pedido {
        this.validar(pedido);
        this.calcularValor(pedido);
        // O total é recalculado antes da estratégia para não acumular ajustes entre chamadas.
        this.estrategia.aplicar(pedido);
        return pedido;
    }

    protected validar(pedido: Pedido): void {
        if (!pedido.cliente || !pedido.servico) {
            throw new Error("Pedido inválido.");
        }
    }

    protected calcularValor(pedido: Pedido): void {
        // Cada serviço calcula seu próprio preço; o pedido soma esses valores como base.
        pedido.valorTotal = pedido.calcularTotal();
    }
}
