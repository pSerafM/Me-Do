import { Pedido } from "../models/Pedido";

// Implementação do template method é nessa classe. 
// O método processar() fixa a sequência: validar, calcualrValor, aplicarRegras, finalizarProcessamento. 
export abstract class ProcessarPedido {
    processar(pedido: Pedido): Pedido {
        this.validar(pedido);
        this.calcularValor(pedido);
        this.aplicarRegras(pedido);
        this.finalizarProcessamento(pedido);

        return pedido;
    }

    protected validar(pedido: Pedido): void {
        if (!pedido.cliente || !pedido.servico) {
            throw new Error("Pedido inválido.");
        }
    }

    protected calcularValor(pedido: Pedido): void {
        pedido.valorTotal = pedido.calcularTotal();
    }

    protected abstract aplicarRegras(pedido: Pedido): void; //apenas esse é abstrato e é aplicado com o alterarStatus (do model Pedido) 

    protected finalizarProcessamento(pedido: Pedido): void {
        pedido.alterarStatus("processando");
    }
}
