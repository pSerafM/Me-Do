import { CobrancaHoraTecnica } from "./CobrancaHoraTecnica";
import { CobrancaOrcamento } from "./CobrancaOrcamento";
import { CobrancaPrecoFixo } from "./CobrancaPrecoFixo";
import type { TipoCobranca } from "./EstrategiaCobranca";

// Traduz o tipo simples recebido da tela/API para o objeto que sabe calcular o preço.
export function criarEstrategiaCobranca(tipo: TipoCobranca, valorOrcado?: number) {
    switch (tipo) {
        case "hora_tecnica":
            // O valor cadastrado passa a representar o preço de cada hora.
            return new CobrancaHoraTecnica();
        case "orcamento":
            // Repassa o orçamento salvo, quando houver; sem ele usa-se o preço cadastrado.
            return new CobrancaOrcamento(valorOrcado);
        case "preco_fixo":
            // É a escolha padrão e preserva o cálculo que existia antes do Strategy.
            return new CobrancaPrecoFixo();
    }
}
