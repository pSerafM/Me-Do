import type { Insumo } from "./Insumo";

//Esse é o singleton. Ele garante que exista uma única isntância de estoque em toda a aplicação, com um ponto de acesso global (getInstancia).
export class Estoque {
    private static instancia: Estoque; //Atributo que pertence à classe e guarda a única instância.
    private readonly insumos: Insumo[] = [];

    private constructor() {} //O construtor é privado, fazendo com que ninguém de fora consiga fazer um "newEstoque()".

    //Ponto de acesso global. Se a instância ainda não existe, cria uma nova. Se já existe, devolve a existente.
    static getInstancia(): Estoque {
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
        return [...this.insumos];
    }
}