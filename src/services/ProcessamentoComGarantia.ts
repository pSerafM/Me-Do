import { Pedido } from "../models/Pedido";
import { ProcessarPedido } from "./ProcessarPedido";

export class ProcessarPedidoComGarantia extends ProcessarPedido {
    protected aplicarRegras(pedido: Pedido): void {
        pedido.alterarStatus("garantia");
    }
}