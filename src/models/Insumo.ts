export class Insumo {
    id: number;
    nome: string;
    quantidade: number;
    unidade: string;
    sku: string;
    categoria: string;
    precoCusto: number;
    quantidadeMinima: number;

    constructor(
        id: number,
        nome: string,
        quantidade: number,
        unidade: string,
        sku: string = "",
        categoria: string = "",
        precoCusto: number = 0,
        quantidadeMinima: number = 0
    ) {
        this.id = id;
        this.nome = nome;
        this.quantidade = quantidade;
        this.unidade = unidade;
        this.sku = sku;
        this.categoria = categoria;
        this.precoCusto = precoCusto;
        this.quantidadeMinima = quantidadeMinima;
    }

    atualizarQuantidade(novaQuantidade: number): void {
        this.quantidade = novaQuantidade;
    }

    abaixoDoMinimo(): boolean {
        return this.quantidadeMinima > 0 && this.quantidade <= this.quantidadeMinima;
    }

    exibirDados(): string {
        return `${this.nome} - ${this.quantidade} ${this.unidade}`;
    }
}
