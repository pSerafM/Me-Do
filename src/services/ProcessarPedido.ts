import { Pedido } from "../models/Pedido";
import { ProcessarPedidoComum } from "./ProcessarPedidoComum";
import type { EstrategiaProcessamentoPedido } from "./EstrategiaProcessamentoPedido";

// Contexto Strategy: centraliza o que é igual para todos os processamentos da OS.
export class ProcessarPedido {
    private estrategia: EstrategiaProcessamentoPedido;

    constructor(estrategia: EstrategiaProcessamentoPedido = new ProcessarPedidoComum()) {
        // A regra comum é o padrão, então chamadas antigas continuam funcionando.
        this.estrategia = estrategia;
    }

    // A estratégia pode ser trocada sem criar outro pedido.
    definirEstrategia(estrategia: EstrategiaProcessamentoPedido): void {
        this.estrategia = estrategia;
    }

    processar(pedido: Pedido): Pedido {
        // A validação e o cálculo do total são iguais para todas as estratégias.
        this.validar(pedido);
        this.calcularValor(pedido);
        // Mantém o tipo escolhido no objeto de domínio, além do status produzido abaixo.
        pedido.tipoProcessamento = this.estrategia.tipo;
        // O total é recalculado antes da estratégia para não acumular ajustes entre chamadas.
        this.estrategia.aplicar(pedido);
        return pedido;
    }

    protected validar(pedido: Pedido): void {
        // Um pedido sem cliente ou serviço não pode seguir para processamento.
        if (!pedido.cliente || !pedido.servico) {
            throw new Error("Pedido inválido.");
        }
    }

    protected calcularValor(pedido: Pedido): void {
        // Cada serviço calcula seu próprio preço; o pedido soma esses valores como base.
        // O servidor repete o cálculo antes de gravar para não confiar no navegador.
        pedido.valorTotal = pedido.calcularTotal();
    }
}
