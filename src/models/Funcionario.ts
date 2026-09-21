export class Funcionario {
    idFuncionario: number;
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    genero: string;
    dataDeNascimento: Date;
    cep: string;
    rua: string;
    cidade: string;
    estado: string;
    complemento: string;
    status: string;
    numero: number;

    constructor(
        idFuncionario: number,
        nome: string,
        cpf: string,
        telefone: string,
        email: string,
        genero: string,
        dataDeNascimento: Date,
        cep: string,
        rua: string,
        cidade: string,
        estado: string,
        complemento: string,
        status: string,
        numero: number
    ) {
        this.idFuncionario = idFuncionario;
        this.nome = nome;
        this.cpf = cpf;
        this.telefone = telefone;
        this.email = email;
        this.genero = genero;
        this.dataDeNascimento = dataDeNascimento;
        this.cep = cep;
        this.rua = rua;
        this.cidade = cidade;
        this.estado = estado;
        this.complemento = complemento;
        this.status = status;
        this.numero = numero;
    }

    ativar(): void {
        this.status = "ativo";
    }

    desativar(): void {
        this.status = "inativo";
    }

    exibirDados(): string {
        return `${this.nome} - ${this.email} - ${this.telefone}`;
    }
}   