import { Pedido } from "../models/Pedido";
import { ProcessarPedido } from "./ProcessarPedido";

export class ProcessarPedidoComum extends ProcessarPedido {
    protected aplicarRegras(pedido: Pedido): void {
        pedido.alterarStatus("aprovado");
    }
}
