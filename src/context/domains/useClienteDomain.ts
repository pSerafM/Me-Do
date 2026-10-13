import { useCallback } from "react";
import { apiBody, apiErrorMessage, apiRequest } from "../../api/client";
import { reviverCliente, type ApiCliente } from "../../api/modelsFromApi";
import type { Cliente } from "../../models/Cliente";
import { useCollection } from "./useCollection";

export function useClienteDomain(
    authenticated: boolean,
    reportError: (message: string) => void
) {
    const collection = useCollection<ApiCliente, Cliente>(
        "/clientes",
        authenticated,
        reviverCliente,
        reportError
    );
    const { items, setItems, refresh } = collection;
    const cadastrarCliente = useCallback(
        async (cliente: Cliente): Promise<Cliente | string> => {
            try {
                const row = await apiRequest<ApiCliente>("/clientes", {
                    method: "POST",
                    body: apiBody({
                        nome: cliente.nome,
                        cpfCnpj: cliente.cpfCnpj,
                        telefone: cliente.telefone
                    })
                });
                const created = reviverCliente(row);
                setItems((current) => [...current, created]);
                return created;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [setItems]
    );

    return { clientes: items, refreshClientes: refresh, cadastrarCliente };
}
