import type { Pedido } from "../models/Pedido";
import type { EstrategiaProcessamentoPedido } from "./EstrategiaProcessamentoPedido";

// Processamento em garantia: preserva o total base e altera o status para "garantia".
export class ProcessarPedidoComGarantia implements EstrategiaProcessamentoPedido {
    aplicar(pedido: Pedido): void {
        pedido.alterarStatus("garantia");
    }
}