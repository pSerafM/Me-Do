import type { Insumo } from "./Insumo";

export class Estoque {
    // Singleton: combina o construtor privado com uma referência compartilhada nesta execução.
    private static instancia: Estoque;
    private readonly insumos: Insumo[] = [];

    private constructor() {}

    static getInstancia(): Estoque {
        // Cria o estoque na primeira chamada; depois, devolve sempre a mesma instância.
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
        // Devolve outra lista para evitar alterações diretas ao array interno.
        return [...this.insumos];
    }
}