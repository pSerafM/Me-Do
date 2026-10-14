// Representa uma linha do modal de histórico de alterações do pedido/OS (data, funcionário, título e descrição).
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
