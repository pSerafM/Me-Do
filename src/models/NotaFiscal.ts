export type StatusNota =
    | "autorizada"
    | "em_processamento"
    | "com_erro"
    | "cancelada";

export class NotaFiscal {
    idNotaFiscal: number;
    idPedido: number;
    numero: number;
    serie: string;
    dataEmissao: Date;
    chaveAcesso: string;
    status: StatusNota = "em_processamento";
    mensagemErro: string = "";

    constructor(
        idNotaFiscal: number,
        idPedido: number,
        numero: number,
        serie: string,
        dataEmissao: Date,
        chaveAcesso: string
    ) {
        this.idNotaFiscal = idNotaFiscal;
        this.idPedido = idPedido;
        this.numero = numero;
        this.serie = serie;
        this.dataEmissao = dataEmissao;
        this.chaveAcesso = chaveAcesso;
    }

    gerarChaveAcesso(): void {
        this.chaveAcesso = `${this.serie}-${this.numero}-${this.idPedido}`;
    }

    alterarSerie(novaSerie: string): void {
        this.serie = novaSerie;
    }

    exibirDados(): string {
        return `NF #${this.numero} - Série ${this.serie} - Pedido #${this.idPedido}`;
    }
}