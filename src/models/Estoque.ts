import type { Insumo } from "./Insumo";

//Esse é o singleton. Ele garante que exista uma única instância de estoque em toda a aplicação, com um ponto de acesso global (getInstancia).
//A fonte da verdade continua sendo o banco (via API). O singleton funciona como um espelho em memória dessa lista, sincronizado pelo useEstoqueDomain.
export class Estoque {

    //Atributo que pertence à classe e guarda a única instância.
    private static instancia: Estoque;
    private insumos: Insumo[] = [];

    private constructor() {} //O construtor é privado, fazendo com que ninguém de fora consiga fazer um "new Estoque()".

    //Ponto de acesso global. Se a instância ainda não existe, cria uma nova. Se já existe, devolve a existente.
    static getInstancia(): Estoque {
        // Cria o estoque na primeira chamada; depois, devolve sempre a mesma instância.
        if (!Estoque.instancia) {
            Estoque.instancia = new Estoque();
        }

        return Estoque.instancia;
    }

    //Substitui o conteúdo do espelho pela lista atual (carregada da API, após cadastro ou movimentação). Passar [] limpa o estoque, por exemplo no logout.
    sincronizar(insumos: Insumo[]): void {
        this.insumos = [...insumos];
    }

    //Adiciona insumo
    adicionarInsumo(insumo: Insumo): void {
        this.insumos.push(insumo);
    }

    //Procura insumo
    buscarPorId(id: number): Insumo | undefined {
        return this.insumos.find((insumo) => insumo.id === id);
    }

    //Regra de duplicidade: mesmo SKU (quando informado) ou mesmo nome, ignorando maiúsculas e espaços nas pontas.
    jaCadastrado(insumo: Insumo): boolean {
        const nome = insumo.nome.trim().toLowerCase();
        return this.insumos.some(
            (atual) =>
                (Boolean(insumo.sku) && atual.sku === insumo.sku) ||
                atual.nome.trim().toLowerCase() === nome
        );
    }

    //Devolve cópia da lista para que ninguém de fora acesse o array original.
    listarInsumos(): Insumo[] {
        // Devolve outra lista para evitar alterações diretas ao array interno.
        return [...this.insumos];
    }
}
