import type { Pedido } from "../models/Pedido";
import type { EstrategiaProcessamentoPedido } from "./EstrategiaProcessamentoPedido";

// O processamento urgente mantém o total base e marca o pedido como urgente.
export class ProcessarPedidoUrgente implements EstrategiaProcessamentoPedido {
    aplicar(pedido: Pedido): void {
        pedido.alterarStatus("urgente");
    }
}
