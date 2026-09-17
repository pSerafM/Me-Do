export class Insumo {
    id: number;
    nome: string;
    quantidade: number;
    unidade: string;

    constructor(
        id: number,
        nome: string,
        quantidade: number,
        unidade: string
    ) {
        this.id = id;
        this.nome = nome;
        this.quantidade = quantidade;
        this.unidade = unidade;
    }

    atualizarQuantidade(novaQuantidade: number): void {
        this.quantidade = novaQuantidade;
    }

    exibirDados(): string {
        return `${this.nome} - ${this.quantidade} ${this.unidade}`;
    }
}