import { Cliente } from "./Cliente";
import { Servico } from "./Servico";

export class Pedido {
    id: number;
    cliente: Cliente;
    servico: Servico;
    status: string;
    valorTotal: number;

    constructor(
        id: number,
        cliente: Cliente,
        servico: Servico
    ) {
        this.id = id;
        this.cliente = cliente;
        this.servico = servico;
        this.status = "aberto";
        this.valorTotal = servico.calcularValor();
    }

    alterarStatus(novoStatus: string): void {
        this.status = novoStatus;
    }

    finalizar(): void {
        this.status = "finalizado";
    }

    resumo(): string {
        return `Pedido #${this.id} - ${this.cliente.nome} - ${this.servico.nome}`;
    }
}