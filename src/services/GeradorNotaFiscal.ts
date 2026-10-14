export class GeradorNotaFiscal {
    // Singleton: mantém uma instância e um contador compartilhados nesta execução.
    private static instancia: GeradorNotaFiscal;
    // O contador é apenas em memória; reiniciar a aplicação volta ao número inicial.
    private proximoNumero: number = 1;

    private constructor() {}

    static getInstancia(): GeradorNotaFiscal {
        // Inicialização tardia: cria o gerador só quando alguém solicitar a instância.
        if (!GeradorNotaFiscal.instancia) {
            GeradorNotaFiscal.instancia = new GeradorNotaFiscal();
        }

        return GeradorNotaFiscal.instancia;
    }

    gerarNumero(): number {
        // Entrega o número atual e avança o contador para a próxima chamada.
        return this.proximoNumero++;
    }

    consultarProximoNumero(): number {
        // Consulta sem consumir o número.
        return this.proximoNumero;
    }
}