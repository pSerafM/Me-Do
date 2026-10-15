import type { Pedido } from "../models/Pedido";
import type { EstrategiaProcessamentoPedido } from "./EstrategiaProcessamentoPedido";

// Processamento padrão: preserva o total base e altera o status para "aprovado".
export class ProcessarPedidoComum implements EstrategiaProcessamentoPedido {
    aplicar(pedido: Pedido): void {
        pedido.alterarStatus("aprovado");
    }
}
