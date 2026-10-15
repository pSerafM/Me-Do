import type { DadosServicoCobranca, EstrategiaCobranca } from "./EstrategiaCobranca";

// Calcula a cobrança multiplicando o valor da hora pelas horas estimadas.
export class CobrancaHoraTecnica implements EstrategiaCobranca {
    readonly nome = "Hora técnica";

    calcular(servico: DadosServicoCobranca): number {
        return servico.valor * servico.horasEstimadas;
    }
}
