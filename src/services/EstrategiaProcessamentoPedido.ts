import type { Pedido } from "../models/Pedido";

// Contrato do Strategy: cada regra recebe a OS e define seu comportamento específico.
export interface EstrategiaProcessamentoPedido {
    aplicar(pedido: Pedido): void;
}
