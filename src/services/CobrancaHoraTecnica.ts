import type { DadosServicoCobranca, EstrategiaCobranca } from "./EstrategiaCobranca";

// Estratégia que trata o valor cadastrado como preço de uma hora de trabalho.
export class CobrancaHoraTecnica implements EstrategiaCobranca {
    // Identificador salvo no banco para que a OS mantenha esta regra após recarregar.
    readonly tipo = "hora_tecnica";
    readonly nome = "Hora técnica";

    // Exemplo: 80 reais por hora × 2,5 horas estimadas = 200 reais.
    calcular(servico: DadosServicoCobranca): number {
        return servico.valor * servico.horasEstimadas;
    }
}
