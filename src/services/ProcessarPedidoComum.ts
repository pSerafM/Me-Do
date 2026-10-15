import type { Pedido } from "../models/Pedido";
import type { EstrategiaProcessamentoPedido } from "./EstrategiaProcessamentoPedido";

// O processamento comum mantém o total base e marca o pedido como aprovado.
export class ProcessarPedidoComum implements EstrategiaProcessamentoPedido {
    aplicar(pedido: Pedido): void {
        pedido.alterarStatus("aprovado");
    }
}
