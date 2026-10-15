import type { Pedido } from "../models/Pedido";
import type { EstrategiaProcessamentoPedido } from "./EstrategiaProcessamentoPedido";

// Processamento padrão: preserva o total base e altera o status para "aprovado".
export class ProcessarPedidoComum implements EstrategiaProcessamentoPedido {
    // Este valor é persistido como tipo_processamento na tabela pedido.
    readonly tipo = "comum";

    aplicar(pedido: Pedido): void {
        // O processamento comum não altera o total, apenas aprova a ordem.
        pedido.alterarStatus("aprovado");
    }
}
