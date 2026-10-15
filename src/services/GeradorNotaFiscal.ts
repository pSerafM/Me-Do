// Exemplo didático: este contador em memória não define a numeração persistida das notas.
export class GeradorNotaFiscal {
    // Singleton: mantém uma única instância do gerador de nota fiscal.
    private static instancia: GeradorNotaFiscal;

    // Contador mantido em memória para gerar números sequenciais de nota fiscal.
    private proximoNumero: number = 1;


    private constructor() {}

    static getInstancia(): GeradorNotaFiscal {
        // Cria a instância única do gerador de nota fiscal, se ainda não existir.
        if (!GeradorNotaFiscal.instancia) {
            GeradorNotaFiscal.instancia = new GeradorNotaFiscal();
        }

        return GeradorNotaFiscal.instancia;
    }

    gerarNumero(): number {
        // Retorna o número atual e incrementa o contador.
        return this.proximoNumero++;
    }

    consultarProximoNumero(): number {
        return this.proximoNumero;
    }
}