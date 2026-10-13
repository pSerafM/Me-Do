import { useCallback } from "react";
import { apiBody, apiErrorMessage, apiRequest } from "../../api/client";
import { reviverInsumo, type ApiInsumo } from "../../api/modelsFromApi";
import type { TipoMovimentacao } from "../AppContext";
import type { Insumo } from "../../models/Insumo";
import { useCollection } from "./useCollection";

export function useEstoqueDomain(
    authenticated: boolean,
    reportError: (message: string) => void
) {
    const collection = useCollection<ApiInsumo, Insumo>(
        "/estoque",
        authenticated,
        reviverInsumo,
        reportError
    );
    const { items, setItems, refresh } = collection;
    const cadastrarInsumo = useCallback(
        async (insumo: Insumo): Promise<string | null> => {
            if (
                items.some(
                    (current) =>
                        (insumo.sku && current.sku === insumo.sku) ||
                        current.nome.trim().toLowerCase() === insumo.nome.trim().toLowerCase()
                )
            ) {
                return "Esse insumo já está registrado.";
            }
            try {
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
                setItems((currentItems) => [...currentItems, reviverInsumo(row)]);
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [items, setItems]
    );
    const movimentarEstoque = useCallback(
        async (
            id: number,
            tipo: TipoMovimentacao,
            quantidade: number,
            observacao: string
        ): Promise<string | null> => {
            const current = items.find((item) => item.id === id);
            if (!current) return "Insumo não encontrado.";
            if (Number.isNaN(quantidade) || quantidade < 0 || (tipo !== "ajuste" && quantidade === 0)) {
                return "Informe uma quantidade válida.";
            }
            try {
                const row = await apiRequest<ApiInsumo>(`/estoque/${id}/movimentacoes`, {
                    method: "POST",
                    body: apiBody({ tipo, quantidade, observacao })
                });
                setItems((currentItems) =>
                    currentItems.map((item) => (item.id === id ? reviverInsumo(row) : item))
                );
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [items, setItems]
    );

    return {
        insumos: items,
        refreshInsumos: refresh,
        cadastrarInsumo,
        movimentarEstoque
    };
}
