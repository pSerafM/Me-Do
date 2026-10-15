import { ProcessarPedidoComGarantia } from "./ProcessarPedidoComGarantia";
import { ProcessarPedidoComum } from "./ProcessarPedidoComum";
import { ProcessarPedidoUrgente } from "./ProcessarPedidoUrgente";
import type { TipoProcessamentoPedido } from "./EstrategiaProcessamentoPedido";

// Converte o tipo da tela/API na classe que implementa esse processamento.
export function criarEstrategiaProcessamento(tipo: TipoProcessamentoPedido) {
    switch (tipo) {
        case "urgente":
            // Processamento prioritário: mantém o total e atribui status urgente.
            return new ProcessarPedidoUrgente();
        case "garantia":
            // Atendimento em garantia: mantém o total e atribui status garantia.
            return new ProcessarPedidoComGarantia();
        case "comum":
            // Comportamento padrão quando o usuário não escolhe uma prioridade especial.
            return new ProcessarPedidoComum();
    }
}
