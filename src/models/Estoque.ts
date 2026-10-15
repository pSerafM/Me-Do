import type { Insumo } from "./Insumo";

//Esse é o singleton. Ele garante que exista uma única isntância de estoque em toda a aplicação, com um ponto de acesso global (getInstancia).
export class Estoque {

    // Singleton: combina o construtor privado com uma referência compartilhada nesta execução.
    //Atributo que pertence à classe e guarda a única instância.
    private static instancia: Estoque;
    private readonly insumos: Insumo[] = [];

    private constructor() {} //O construtor é privado, fazendo com que ninguém de fora consiga fazer um "newEstoque()".

    //Ponto de acesso global. Se a instância ainda não existe, cria uma nova. Se já existe, devolve a existente.
    static getInstancia(): Estoque {
        // Cria o estoque na primeira chamada; depois, devolve sempre a mesma instância.
        if (!Estoque.instancia) {
            Estoque.instancia = new Estoque();
        }

        return Estoque.instancia;
    }

    //Adiciona insumo
    adicionarInsumo(insumo: Insumo): void {
        this.insumos.push(insumo);
    }

    //Procura insumo
    buscarPorId(id: number): Insumo | undefined {
        return this.insumos.find((insumo) => insumo.id === id);
    }

    //Devolve vópia da lista para que ningém de fora acesse o array original.
    listarInsumos(): Insumo[] {
        // Devolve outra lista para evitar alterações diretas ao array interno.
        return [...this.insumos];
    }
}