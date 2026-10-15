import type { Pedido } from "../models/Pedido";
import type { EstrategiaProcessamentoPedido } from "./EstrategiaProcessamentoPedido";

// Processamento em garantia: preserva o total base e altera o status para "garantia".
export class ProcessarPedidoComGarantia implements EstrategiaProcessamentoPedido {
    // O valor é enviado ao backend para persistir a opção selecionada.
    readonly tipo = "garantia";

    aplicar(pedido: Pedido): void {
        // A garantia muda o status; não aplica desconto porque não há regra definida para isso.
        pedido.alterarStatus("garantia");
    }
}