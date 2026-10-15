// Evento imutável do histórico da OS: data, funcionário responsável, título e descrição.
export class RegistroLog {
    data: Date;
    funcionario: string;
    titulo: string;
    descricao: string;

    constructor(
        data: Date,
        funcionario: string,
        titulo: string,
        descricao: string
    ) {
        this.data = data;
        this.funcionario = funcionario;
        this.titulo = titulo;
        this.descricao = descricao;
    }
}
