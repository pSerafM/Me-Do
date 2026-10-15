//Ponto onde o template method é usado. Ele é chamado pelo hook de domínio (useEstoqueDomain) e recebe o tipo de movimentação vindo da tela. A fábrica devolve a classe que sabe executar aquele tipo de movimentação e o esqueleto do template method é rodado.

import { useCallback, useEffect } from "react";
import { apiBody, apiErrorMessage, apiRequest } from "../../api/client";
import { reviverInsumo, type ApiInsumo } from "../../api/modelsFromApi";
import type { TipoMovimentacao } from "../AppContext";
import type { Insumo } from "../../models/Insumo";

//Singleton: espelho em memória do estoque, com um único ponto de acesso em toda a aplicação.
import { Estoque } from "../../models/Estoque";

//Factory do template method. Escolhe a classe de movimentação pelo tipo.
import { obterMovimentacao } from "../../services/MovimentacaoEstoqueFactory";
import { useCollection } from "./useCollection";

//Hook com toda a lógica de estado do estoque.
export function useEstoqueDomain(
    authenticated: boolean,
    reportError: (message: string) => void
) {

    //Carrega a lista de insumos da API e guarda no estado.
    const collection = useCollection<ApiInsumo, Insumo>(
        "/estoque",
        authenticated,
        reviverInsumo, //Converte o JSON da API em objetos da classe insumo.
        reportError
    );
    const { items, setItems, refresh } = collection;

    useEffect(() => {
        Estoque.getInstancia().sincronizar(items); //Mantém o Singleton sempre igual à lista do estado. Roda depois de carregar, cadastrar, movimentar e também no logout (items vira []), então nunca sobra dado de outra sessão.
    }, [items]);

    //Cadastra um novo insumo.
    const cadastrarInsumo = useCallback(
        async (insumo: Insumo): Promise<string | null> => {

            if (Estoque.getInstancia().jaCadastrado(insumo)) { //Evita duplicidade por número de SKU ou nome. A regra fica no Singleton, que tem a lista completa.
                return "Esse insumo já está registrado.";
            }
            try {

                //Salva no banco via API.
                const row = await apiRequest<ApiInsumo>("/estoque", {
                    method: "POST",
                    body: apiBody({
                        nome: insumo.nome,
                        quantidade: insumo.quantidade,
                        unidade: insumo.unidade,
                        sku: insumo.sku,
                        categoria: insumo.categoria,
                        precoCusto: insumo.precoCusto,
                        quantidadeMinima: insumo.quantidadeMinima
                    })
                });

                //Adiciona o insumo criado na lista local.
                setItems((currentItems) => [...currentItems, reviverInsumo(row)]);
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [setItems]
    );

    //Registra movimentação em um insumo (seja entrada, saída ou ajuste). é tambpem onde o template method é usado.
    const movimentarEstoque = useCallback(
        async (
            id: number,
            tipo: TipoMovimentacao,
            quantidade: number,
            observacao: string
        ): Promise<string | null> => {
            const current = Estoque.getInstancia().buscarPorId(id); //Busca o insumo no Singleton (espelho do estoque) em vez de varrer o estado.
            if (!current) return "Insumo não encontrado.";

            //Escolhe a classe pelo tipo e roda o esqueleto do template method. Se houver algum erro de regra, a mensagem é devolvida e a API não é chamada.
            try {
                obterMovimentacao(tipo).executar(current, quantidade);
            } catch (error) {
                return error instanceof Error ? error.message : "Movimentação inválida.";
            }
            try {

                //Persiste a movimentação no banco.
                const row = await apiRequest<ApiInsumo>(`/estoque/${id}/movimentacoes`, {
                    method: "POST",
                    body: apiBody({ tipo, quantidade, observacao })
                });

                //Substitui o insumo antigo pelo atualizado devolvido pela API.
                setItems((currentItems) =>
                    currentItems.map((item) => (item.id === id ? reviverInsumo(row) : item))
                );
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [setItems]
    );

    return {
        insumos: items,
        refreshInsumos: refresh,
        cadastrarInsumo,
        movimentarEstoque
    };
}
