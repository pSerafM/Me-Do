import { useCallback } from "react";
import { apiBody, apiErrorMessage, apiRequest } from "../../api/client";
import { reviverFuncionario, type ApiFuncionario } from "../../api/modelsFromApi";
import type { Funcionario } from "../../models/Funcionario";
import { useCollection } from "./useCollection";

export function useFuncionarioDomain(
    authenticated: boolean,
    reportError: (message: string) => void
) {
    const collection = useCollection<ApiFuncionario, Funcionario>(
        "/funcionarios",
        authenticated,
        reviverFuncionario,
        reportError
    );
    const { items, setItems, refresh } = collection;

    const cadastrarFuncionario = useCallback(
        async (funcionario: Funcionario, senha: string): Promise<string | null> => {
            try {
                const row = await apiRequest<ApiFuncionario>("/funcionarios", {
                    method: "POST",
                    body: apiBody({
                        nome: funcionario.nome,
                        cpf: funcionario.cpf,
                        telefone: funcionario.telefone,
                        email: funcionario.email,
                        senha,
                        genero: funcionario.genero,
                        dataDeNascimento: funcionario.dataDeNascimento.toISOString().slice(0, 10),
                        cep: funcionario.cep,
                        rua: funcionario.rua,
                        cidade: funcionario.cidade,
                        estado: funcionario.estado,
                        complemento: funcionario.complemento,
                        numero: funcionario.numero
                    })
                });
                setItems((currentItems) => [...currentItems, reviverFuncionario(row)]);
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [setItems]
    );

    const atualizarFuncionario = useCallback(
        async (id: number, dados: Partial<Funcionario>): Promise<string | null> => {
            const body = {
                ...dados,
                dataDeNascimento: dados.dataDeNascimento?.toISOString().slice(0, 10)
            };
            try {
                const row = await apiRequest<ApiFuncionario>(`/funcionarios/${id}`, {
                    method: "PATCH",
                    body: apiBody(body)
                });
                setItems((items) =>
                    items.map((employee) =>
                        employee.idFuncionario === id ? reviverFuncionario(row) : employee
                    )
                );
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [setItems]
    );

    const excluirFuncionario = useCallback(
        async (id: number): Promise<string | null> => {
            try {
                await apiRequest(`/funcionarios/${id}/inativar`, { method: "POST" });
                setItems((items) =>
                    items.filter((employee) => employee.idFuncionario !== id)
                );
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [setItems]
    );

    return {
        funcionarios: items,
        refreshFuncionarios: refresh,
        cadastrarFuncionario,
        atualizarFuncionario,
        excluirFuncionario
    };
}
