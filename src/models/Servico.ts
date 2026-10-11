export class Servico {
    id: number;
    nome: string;
    valor: number;
    horasEstimadas: number;
    descricao: string;
    status: boolean;

    constructor(
        id: number,
        nome: string,
        valor: number,
        horasEstimadas: number,
        descricao: string = ""
    ) {
        this.id = id;
        this.nome = nome;
        this.valor = valor;
        this.horasEstimadas = horasEstimadas;
        this.descricao = descricao;
        this.status = true;
    }

    ativar(): void {
        this.status = true;
    }

    desativar(): void {
        this.status = false;
    }

    calcularValor(): number {
        return this.valor;
    }
}