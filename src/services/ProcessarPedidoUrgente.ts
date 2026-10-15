import type { Pedido } from "../models/Pedido";
import type { EstrategiaProcessamentoPedido } from "./EstrategiaProcessamentoPedido";

// Processamento prioritário: preserva o total base e altera o status para "urgente".
export class ProcessarPedidoUrgente implements EstrategiaProcessamentoPedido {
    // O valor é enviado ao backend para persistir a opção selecionada.
    readonly tipo = "urgente";

    aplicar(pedido: Pedido): void {
        // A urgência muda o status; não adiciona taxa porque ainda não há regra de preço definida.
        pedido.alterarStatus("urgente");
    }
}
