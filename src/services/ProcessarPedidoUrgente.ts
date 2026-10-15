import type { Pedido } from "../models/Pedido";
import type { EstrategiaProcessamentoPedido } from "./EstrategiaProcessamentoPedido";

// Processamento prioritário: preserva o total base e altera o status para "urgente".
export class ProcessarPedidoUrgente implements EstrategiaProcessamentoPedido {
    aplicar(pedido: Pedido): void {
        pedido.alterarStatus("urgente");
    }
}
