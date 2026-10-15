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
        // Delega o preço à estratégia configurada no serviço.
        return this.servico.calcularValor();
    }

    horasEstimadas(): number {
        return this.servico.horasEstimadas;
    }
}
