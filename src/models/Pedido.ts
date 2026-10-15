// O que chamamod também de OS (Ordem de Serviço) e contém: cliente, serviço, item, etapda, datas, laudo, pagamentos e log. 

import { Cliente } from "./Cliente";
import { Servico } from "./Servico";
import type { ItemPedido } from "./ItemPedido";
import type { ItemInsumo } from "./itemInsumo";
import type { Checkout } from "./Checkout";
import { RegistroLog } from "./RegistroLog";
import type { TipoProcessamentoPedido } from "../services/EstrategiaProcessamentoPedido";

// Etapas do quadro Kanban de Ordens de Serviço (mais os estados finais).
export type EtapaOS =
    | "aberto"
    | "analise"
    | "aguardando_insumo"
    | "manutencao"
    | "pronto_retirada"
    | "retirado"
    | "cancelado";

export const ROTULO_ETAPA: Record<EtapaOS, string> = { //definição das constantes das etapas do kanban de ordens de serviço 
    aberto: "Em Aberto",
    analise: "Análise/ Orçamento",
    aguardando_insumo: "Aguardando Insumo",
    manutencao: "Em Manutenção",
    pronto_retirada: "Pronto para Retirada",
    retirado: "Retirado",
    cancelado: "Cancelado"
};

export class Pedido {
    id: number;
    cliente: Cliente;
    servico: Servico;
    status: string;
    // Mantém o tipo escolhido separado da etapa do Kanban e do status resultante.
    tipoProcessamento: TipoProcessamentoPedido = "comum";
    valorTotal: number;

    itens: ItemPedido[];
    etapa: EtapaOS = "aberto"; //representa o andamento do kanban
    dataAbertura: Date = new Date();
    dataPrevisao: Date;
    dataConclusao: Date | null = null;
    laudoTecnico: string = "";
    insumosUsados: ItemInsumo[] = [];
    pagamentos: Checkout[] = [];
    log: RegistroLog[] = [];
    motivoCancelamento: string = "";
    encerrado: boolean = false;

    // Modelo de domínio usado pela interface; a API é a fonte persistente dos pedidos.
    constructor(
        id: number,
        cliente: Cliente,
        servico: Servico,
        itens: ItemPedido[] = []
    ) {
        this.id = id;
        this.cliente = cliente;
        this.servico = servico;
        this.itens = itens;
        this.status = "aberto";
        this.valorTotal = this.calcularTotal();
        this.dataPrevisao = new Date(
            this.dataAbertura.getTime() + this.horasEstimadas() * 3_600_000
        );
    }

    // Soma o preço calculado por cada serviço; sem itens, usa o serviço principal.
    calcularTotal(): number {
        if (this.itens.length === 0) {
            return this.servico.calcularValor();
        }

        return this.itens.reduce(
            (total, item) => total + item.valorCobrado(),
            0
        );
    }

    horasEstimadas(): number {
        if (this.itens.length === 0) {
            return this.servico.horasEstimadas;
        }

        return this.itens.reduce(
            (total, item) => total + item.horasEstimadas(),
            0
        );
    }

    valorPago(): number {
        // Pagamentos são eventos separados; total pago é a soma de todos eles.
        return this.pagamentos.reduce(
            (total, pagamento) => total + pagamento.valorPago,
            0
        );
    }

    saldo(): number {
        // Evita apresentar saldo negativo quando o total já foi pago.
        return Math.max(this.valorTotal - this.valorPago(), 0);
    }

    alterarEtapa(novaEtapa: EtapaOS): void {
        this.etapa = novaEtapa;
    }

    registrarLog(funcionario: string, titulo: string, descricao: string): void {
        this.log.push(new RegistroLog(new Date(), funcionario, titulo, descricao));
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
