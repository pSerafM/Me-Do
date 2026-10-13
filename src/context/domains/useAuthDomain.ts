import { useCallback, useEffect, useState } from "react";
import { apiBody, apiErrorMessage, apiRequest, ApiError } from "../../api/client";
import type { Usuario } from "../AppContext";

interface AuthResponse {
    user: Usuario;
}

export function useAuthDomain(reportError: (message: string) => void) {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [carregandoSessao, setCarregandoSessao] = useState(true);

    useEffect(() => {
        let current = true;
        apiRequest<AuthResponse>("/auth/me")
            .then(({ user }) => {
                if (current) setUsuario(user);
            })
            .catch((error: unknown) => {
                if (current && (!(error instanceof ApiError) || error.status !== 401)) {
                    reportError(apiErrorMessage(error));
                }
            })
            .finally(() => {
                if (current) setCarregandoSessao(false);
            });
        return () => {
            current = false;
        };
    }, [reportError]);

    const login = useCallback(
        async (email: string, senha: string): Promise<string | null> => {
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
            setUsuario(null);
        }
    }, [reportError]);

    const atualizarUsuario = useCallback(
        async (dados: Usuario, senha?: string): Promise<string | null> => {
            if (!usuario) return "Sessão não autenticada.";
            try {
                const { user } = await apiRequest<AuthResponse>(
                    `/funcionarios/${usuario.idFuncionario}`,
                    {
                        method: "PATCH",
                        body: apiBody({ nome: dados.nome, email: dados.email, ...(senha ? { senha } : {}) })
                    }
                );
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
