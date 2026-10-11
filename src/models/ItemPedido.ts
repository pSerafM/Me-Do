import type { Servico } from "./Servico";

// Um serviço dentro do atendimento, com os dados do produto que vai recebê-lo
// (tela "Detalhes do Serviço" / "Resumo").
export class ItemPedido {
    servico: Servico;
    modelo: string;
    marca: string;
    numeroSerie: string;
    estado: string;
    observacao: string;
    foto: string;

    constructor(
        servico: Servico,
        modelo: string,
        marca: string,
        numeroSerie: string,
        estado: string,
        observacao: string,
        foto: string = ""
    ) {
        this.servico = servico;
        this.modelo = modelo;
        this.marca = marca;
        this.numeroSerie = numeroSerie;
        this.estado = estado;
        this.observacao = observacao;
        this.foto = foto;
    }

    valorCobrado(): number {
        return this.servico.calcularValor();
    }

    horasEstimadas(): number {
        return this.servico.horasEstimadas;
    }
}
