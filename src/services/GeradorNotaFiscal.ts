export class GeradorNotaFiscal {
    private static instancia: GeradorNotaFiscal;
    private proximoNumero: number = 1;

    private constructor() {}

    static getInstancia(): GeradorNotaFiscal {
        if (!GeradorNotaFiscal.instancia) {
            GeradorNotaFiscal.instancia = new GeradorNotaFiscal();
        }

        return GeradorNotaFiscal.instancia;
    }

    gerarNumero(): number {
        return this.proximoNumero++;
    }

    consultarProximoNumero(): number {
        return this.proximoNumero;
    }
}