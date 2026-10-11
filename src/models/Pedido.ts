import { Cliente } from "./Cliente";
import { Servico } from "./Servico";
import type { ItemPedido } from "./ItemPedido";
import type { ItemInsumo } from "./itemInsumo";
import type { Checkout } from "./Checkout";
import { RegistroLog } from "./RegistroLog";

// Etapas do quadro Kanban de Ordens de Serviço (mais os estados finais).
export type EtapaOS =
    | "aberto"
    | "analise"
    | "aguardando_insumo"
    | "manutencao"
    | "pronto_retirada"
    | "retirado"
    | "cancelado";

export const ROTULO_ETAPA: Record<EtapaOS, string> = {
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
    valorTotal: number;

    // --- acrescentados para as telas da documentação ---
    itens: ItemPedido[];
    etapa: EtapaOS = "aberto";
    dataAbertura: Date = new Date();
    dataPrevisao: Date;
    dataConclusao: Date | null = null;
    laudoTecnico: string = "";
    insumosUsados: ItemInsumo[] = [];
    pagamentos: Checkout[] = [];
    log: RegistroLog[] = [];
    motivoCancelamento: string = "";
    encerrado: boolean = false;

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

    // Soma dos itens do atendimento; sem itens, usa o serviço único.
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
        return this.pagamentos.reduce(
            (total, pagamento) => total + pagamento.valorPago,
            0
        );
    }

    saldo(): number {
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
