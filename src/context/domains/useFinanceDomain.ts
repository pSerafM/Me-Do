import { useCallback } from "react";
import { apiBody, apiErrorMessage, apiRequest } from "../../api/client";
import {
    reviverDespesa,
    reviverNota,
    type ApiDespesa,
    type ApiNota
} from "../../api/modelsFromApi";
import { NotaFiscal } from "../../models/NotaFiscal";
import type { NotaFiscal as NotaFiscalModel } from "../../models/NotaFiscal";
import type { Despesa } from "../../models/Despezas";
import { useCollection } from "./useCollection";

export function useFinanceDomain(
    authenticated: boolean,
    podeGerenciarDespesas: boolean,
    reportError: (message: string) => void
) {
    const despesas = useCollection<ApiDespesa, Despesa>(
        "/despesas",
        authenticated && podeGerenciarDespesas,
        reviverDespesa,
        reportError
    );
    const notas = useCollection<ApiNota, NotaFiscalModel>(
        "/notas-fiscais",
        authenticated,
        reviverNota,
        reportError
    );
    const { items: despesasItems, setItems: setDespesasItems, refresh: refreshDespesas } = despesas;
    const { items: notasItems, setItems: setNotasItems, refresh: refreshNotas } = notas;

    const registrarDespesa = useCallback(
        async (descricao: string, valor: number, data: Date): Promise<string | null> => {
            try {
                const row = await apiRequest<ApiDespesa>("/despesas", {
                    method: "POST",
                    body: apiBody({ descricao, valor, data: data.toISOString().slice(0, 10) })
                });
                setDespesasItems((items) => [reviverDespesa(row), ...items]);
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [setDespesasItems]
    );

    const pagarDespesa = useCallback(
        async (id: number): Promise<string | null> => {
            try {
                const row = await apiRequest<ApiDespesa>(`/despesas/${id}/pagamento`, {
                    method: "POST"
                });
                setDespesasItems((items) =>
                    items.map((expense) =>
                        expense.idDespesa === id ? reviverDespesa(row) : expense
                    )
                );
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [setDespesasItems]
    );

    const reenviarNota = useCallback(
        async (id: number): Promise<string | null> => {
            try {
                await apiRequest(`/notas-fiscais/${id}/reenvio`, { method: "POST" });
                setNotasItems((items) =>
                    items.map((note) => {
                        if (note.idNotaFiscal !== id) return note;
                        const updated = new NotaFiscal(
                            note.idNotaFiscal,
                            note.idPedido,
                            note.numero,
                            note.serie,
                            note.dataEmissao,
                            note.chaveAcesso
                        );
                        updated.status = "em_processamento";
                        return updated;
                    })
                );
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [setNotasItems]
    );

    return {
        despesas: despesasItems,
        notas: notasItems,
        refreshDespesas,
        refreshNotas,
        registrarDespesa,
        pagarDespesa,
        reenviarNota
    };
}
