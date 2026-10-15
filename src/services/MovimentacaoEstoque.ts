//Classe central do template method. Define a ordem dos passos e o que cada passo faz. As subclasses só mudam o conteúdo de alguns passos.

import type { Insumo } from "../models/Insumo";

//Classe abstrata que define o esqueleto do goritmo de movimentação de estoque. A ordem dos pasos é a mesma e as subclasses só mudam o conteúdo de alguns passos.
export abstract class MovimentacaoEstoque {
    //Template method: define a ordem fixa dos passos. Nenhuma subclasse pode sobrescrever este método.
    executar(insumo: Insumo, quantidade: number): number {
        this.validarQuantidade(quantidade);
        this.validarRegra(insumo, quantidade);

        return this.aplicar(insumo, quantidade);//Calcula novo saldo e cada subclasse faz do seu jeito.
    }

    //Passo obrigatório: a quantidade precisa ser maior do que 0. As subclasses podem sobrescrever se a regra for diferente (exemplo: ajuste de estoque permite 0).
    protected validarQuantidade(quantidade: number): void {
        if (Number.isNaN(quantidade) || quantidade <= 0) {
            throw new Error("Informe uma quantidade maior que zero.");
        }
    }

    // Passo gancho (hook): por padrão não faz nada. Só sobrescreve quem tem uma regra extra.
    protected validarRegra(_insumo: Insumo, _quantidade: number): void {}

    // Passo obrigatório: devolve a nova quantidade do insumo. Cada subclasse define como calcular o novo saldo.
    protected abstract aplicar(insumo: Insumo, quantidade: number): number;
}
