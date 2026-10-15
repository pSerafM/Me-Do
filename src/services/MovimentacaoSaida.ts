//Sobrescreve dois passos do template melhod: 'validarRegra' lança erro se a quantidade for maior que o saldo e 'aplicar' que faz saldo menos quantidade (S - Q).

import type { Insumo } from "../models/Insumo";
import { MovimentacaoEstoque } from "./MovimentacaoEstoque";

//Subclasse concreta do template method. A saída sobrescreve dois passos: validarRegra e aplicar.
export class MovimentacaoSaida extends MovimentacaoEstoque {
    
    //Sobrascreve o gancho (validarRegra) não pode sair mais do que existe em estoque.
    protected validarRegra(insumo: Insumo, quantidade: number): void {
        if (quantidade > insumo.quantidade) {
            throw new Error("Quantidade maior que o estoque disponível.");
        }
    }

    //Saída de insumo> subtrai a quantidade do saldo atual.
    protected aplicar(insumo: Insumo, quantidade: number): number {
        return insumo.quantidade - quantidade;
    }
}
