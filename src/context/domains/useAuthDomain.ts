import { useCallback, useEffect, useState } from "react";
import { apiBody, apiErrorMessage, apiRequest, ApiError } from "../../api/client";
import type { Usuario } from "../AppContext";

interface AuthResponse {
    user: Usuario;
}

export function useAuthDomain(reportError: (message: string) => void) {
    // Mantém a projeção da sessão necessária à interface; o JWT permanece no cookie do navegador.
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [carregandoSessao, setCarregandoSessao] = useState(true);

    // Na inicialização, pergunta à API se o cookie httpOnly ainda representa uma sessão válida.
    useEffect(() => {
        let current = true;
        apiRequest<AuthResponse>("/auth/me")
            .then(({ user }) => {
                if (current) setUsuario(user);
            })
            .catch((error: unknown) => {
                // 401 representa visitante sem sessão; outros erros indicam uma falha a ser exibida.
                if (current && (!(error instanceof ApiError) || error.status !== 401)) {
                    reportError(apiErrorMessage(error));
                }
            })
            .finally(() => {
                if (current) setCarregandoSessao(false);
            });
        return () => {
            // Evita atualizar estado após desmontagem do provider durante a requisição.
            current = false;
        };
    }, [reportError]);

    const login = useCallback(
        async (email: string, senha: string): Promise<string | null> => {
            // Evita chamada de rede para credenciais obviamente incompletas.
            if (!email.trim() || !senha) return "Informe e-mail e senha.";
            try {
                const { user } = await apiRequest<AuthResponse>("/auth/login", {
                    method: "POST",
                    body: apiBody({ email: email.trim(), senha })
                });
                setUsuario(user);
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        []
    );

    const logout = useCallback(async () => {
        try {
            await apiRequest<void>("/auth/logout", { method: "POST" });
        } catch (error) {
            reportError(apiErrorMessage(error));
        } finally {
            // Limpa a interface mesmo se a chamada falhar; o backend continua sendo a autoridade da sessão.
            setUsuario(null);
        }
    }, [reportError]);

    const atualizarUsuario = useCallback(
        async (dados: Usuario, senha?: string): Promise<string | null> => {
            // O ID vem da sessão atual: esta operação não permite escolher outro funcionário.
            if (!usuario) return "Sessão não autenticada.";
            try {
                const { user } = await apiRequest<AuthResponse>(
                    `/funcionarios/${usuario.idFuncionario}`,
                    {
                        method: "PATCH",
                        body: apiBody({ nome: dados.nome, email: dados.email, ...(senha ? { senha } : {}) })
                    }
                );
                // Atualiza o contexto com os dados canônicos retornados pelo backend.
                setUsuario(user);
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [usuario]
    );

    return { usuario, carregandoSessao, login, logout, atualizarUsuario };
}
