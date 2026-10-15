//Não faz parte do template method, mas pe o seletor que substitui o inf/else. Recebe o tipo de movimentação e devolve a classe que sabe executar aquele tipo de movimentação.

import type { TipoMovimentacao } from "../context/AppContext";
import { MovimentacaoAjuste } from "./MovimentacaoAjuste";
import { MovimentacaoEntrada } from "./MovimentacaoEntrada";
import { MovimentacaoEstoque } from "./MovimentacaoEstoque";
import { MovimentacaoSaida } from "./MovimentacaoSaida";

//Seletor de classe por tipo. Isso substitui o if/else. As instâncias são criadas de uma única vez, pois as classes não guardam estado.
const movimentacoes: Record<TipoMovimentacao, MovimentacaoEstoque> = {
    entrada: new MovimentacaoEntrada(),
    saida: new MovimentacaoSaida(),
    ajuste: new MovimentacaoAjuste()
};

//Recebe o tipo vindo da tela e devolve a classe que sabe executar aquele tipo de movimentação.
export function obterMovimentacao(tipo: TipoMovimentacao): MovimentacaoEstoque {
    return movimentacoes[tipo];
}
