import type { Insumo } from "./Insumo";

export class Estoque {
    private static instancia: Estoque;
    private readonly insumos: Insumo[] = [];

    private constructor() {}

    static getInstancia(): Estoque {
        if (!Estoque.instancia) {
            Estoque.instancia = new Estoque();
        }

        return Estoque.instancia;
    }

    adicionarInsumo(insumo: Insumo): void {
        this.insumos.push(insumo);
    }

    listarInsumos(): Insumo[] {
        return [...this.insumos];
    }
}