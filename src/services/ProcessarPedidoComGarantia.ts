import type { Pedido } from "../models/Pedido";
import type { EstrategiaProcessamentoPedido } from "./EstrategiaProcessamentoPedido";

// O processamento em garantia mantém o total base e marca o pedido como garantia.
export class ProcessarPedidoComGarantia implements EstrategiaProcessamentoPedido {
    aplicar(pedido: Pedido): void {
        pedido.alterarStatus("garantia");
    }
}