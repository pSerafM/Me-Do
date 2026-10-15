// Exemplo didático: este contador em memória não define a numeração persistida das notas.
export class GeradorNotaFiscal {
    private static instancia: GeradorNotaFiscal;
    private proximoNumero = 1;

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