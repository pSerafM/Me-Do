// Linha do "Modal de Log de Alterações no Atendimento do Pedido".
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
