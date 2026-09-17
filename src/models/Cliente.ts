export class Cliente {
    id: number;
    nome: string;
    cpfCnpj: string;
    telefone: string;

    constructor(
        id: number,
        nome: string,
        cpfCnpj: string,
        telefone: string
    ) {
        this.id = id;
        this.nome = nome;
        this.cpfCnpj = cpfCnpj;
        this.telefone = telefone;
    }

    atualizarTelefone(novoTelefone: string): void {
        this.telefone = novoTelefone;
    }

    exibirDados(): string {
        return `${this.nome} - ${this.telefone}`;
    }
}