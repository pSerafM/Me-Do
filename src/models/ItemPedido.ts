import type { Servico } from "./Servico";

// Item de serviço da OS: associa um serviço aos dados do produto que será reparado.
export class ItemPedido {
    servico: Servico;
    modelo: string;
    marca: string;
    numeroSerie: string;
    estado: string;
    observacao: string;
    foto: string;
    // Chave da relação pedido_servico; permite salvar o orçamento da linha certa.
    idPedidoServico?: number;

    constructor(
        servico: Servico,
        modelo: string,
        marca: string,
        numeroSerie: string,
        estado: string,
        observacao: string,
        foto: string = "",
        idPedidoServico?: number
    ) {
        this.servico = servico;
        this.modelo = modelo;
        this.marca = marca;
        this.numeroSerie = numeroSerie;
        this.estado = estado;
        this.observacao = observacao;
        this.foto = foto;
        this.idPedidoServico = idPedidoServico;
    }

    valorCobrado(): number {
        // Delega o preço à estratégia configurada no serviço.
        return this.servico.calcularValor();
    }

    // O prazo total da OS é calculado somando as horas dos seus itens.
    horasEstimadas(): number {
        return this.servico.horasEstimadas;
    }
}
