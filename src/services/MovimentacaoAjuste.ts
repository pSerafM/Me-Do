//Essa subclasse também sobrescreve dois passos: 'validarQuantidade', que aceita 0, porque ajustar o saldo para 0 é válido e 'aplicar', que ignora o saldo atual e devolve a quantidade informada.

import type { Insumo } from "../models/Insumo";
import { MovimentacaoEstoque } from "./MovimentacaoEstoque";

//Ajuste sobrescreve dois passos: validadarQuantidade e aplicar.
export class MovimentacaoAjuste extends MovimentacaoEstoque {

    //No ajuste a quantidade define o novo saldo, então 0 é permitido. Por isso a validação padrão (quantidade > 0) é substituída por (quantidade >= 0).
    protected validarQuantidade(quantidade: number): void {
        if (Number.isNaN(quantidade) || quantidade < 0) {
            throw new Error("Informe uma quantidade válida.");
        }
    }

    //Ignora o saldo atual e devolve a quantidade informada como o novo saldo do insumo.
    protected aplicar(_insumo: Insumo, quantidade: number): number {
        return quantidade;
    }
}
