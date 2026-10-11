import { Pedido } from "../models/Pedido";
import { ProcessarPedido } from "./ProcessarPedido";

export class ProcessarPedidoUrgente extends ProcessarPedido {
    protected aplicarRegras(pedido: Pedido): void {
        pedido.alterarStatus("urgente");
    }
}
