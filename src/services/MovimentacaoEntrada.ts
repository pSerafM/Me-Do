//Subclasse mais simples, que só implementa o passo 'aplicar' e herda as duas validações padrão.

import type { Insumo } from "../models/Insumo";
import { MovimentacaoEstoque } from "./MovimentacaoEstoque";

//Subclasse concreta do template method. Entrada só imlementa o passo abstrato (aplicar) e herda as validações padrão.
export class MovimentacaoEntrada extends MovimentacaoEstoque {
    protected aplicar(insumo: Insumo, quantidade: number): number { //Entrada de insumo: soma a quantidade ao saldo atual.
        return insumo.quantidade + quantidade;
    }
}
