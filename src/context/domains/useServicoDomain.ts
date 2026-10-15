import { useCallback } from "react";
import { apiBody, apiErrorMessage, apiRequest } from "../../api/client";
import { reviverServico, type ApiServico } from "../../api/modelsFromApi";
import type { DadosServico } from "../AppContext";
import type { Servico } from "../../models/Servico";
import { useCollection } from "./useCollection";

export function useServicoDomain(
    authenticated: boolean,
    reportError: (message: string) => void
) {
    const collection = useCollection<ApiServico, Servico>(
        "/servicos",
        authenticated,
        reviverServico,
        reportError
    );
    const { items, setItems, refresh } = collection;
    
    // comentar
    const cadastrarServico = useCallback( 
        async (servico: Servico): Promise<string | null> => {
            if (
                items.some(
                    (current) =>
                        current.nome.trim().toLowerCase() === servico.nome.trim().toLowerCase()
                )
            ) {
                return "Já existe um serviço com esse nome.";
            }
            try {
                const row = await apiRequest<ApiServico>("/servicos", {
                    method: "POST",
                    body: apiBody({
                        nome: servico.nome,
                        valor: servico.valor,
                        horasEstimadas: servico.horasEstimadas,
                        descricao: servico.descricao,
                        status: servico.status
                    })
                });
                setItems((current) => [...current, reviverServico(row)]);
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [items, setItems]
    );

    //comentar
    const alterarServico = useCallback(
        async (id: number, dados: Partial<DadosServico>): Promise<string | null> => {
            const current = items.find((servico) => servico.id === id);
            if (!current) return "Serviço não encontrado.";
            if (
                dados.nome !== undefined &&
                items.some(
                    (servico) =>
                        servico.id !== id &&
                        servico.nome.trim().toLowerCase() === dados.nome?.trim().toLowerCase()
                )
            ) {
                return "Já existe um serviço com esse nome.";
            }
            try {
                const row = await apiRequest<ApiServico>(`/servicos/${id}`, {
                    method: "PATCH",
                    body: apiBody(dados)
                });
                setItems((items) =>
                    items.map((servico) => (servico.id === id ? reviverServico(row) : servico))
                );
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [items, setItems]
    );

    return {
        servicos: items,
        refreshServicos: refresh,
        cadastrarServico,
        alterarServico
    };
}
