import type { Insumo } from "./Insumo";

// Exemplo didático: instância em memória, compartilhada neste runtime.
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

    buscarPorId(id: number): Insumo | undefined {
        return this.insumos.find((insumo) => insumo.id === id);
    }

    listarInsumos(): Insumo[] {
        return [...this.insumos];
    }
}