import type { Pedido } from "../models/Pedido";

// Cada estratégia recebe o pedido e aplica o comportamento específico do tipo de processamento.
export interface EstrategiaProcessamentoPedido {
    aplicar(pedido: Pedido): void;
}
