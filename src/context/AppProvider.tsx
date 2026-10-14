import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { AppContext } from "./AppContext";
import { useAuthDomain } from "./domains/useAuthDomain";
import { useClienteDomain } from "./domains/useClienteDomain";
import { useEstoqueDomain } from "./domains/useEstoqueDomain";
import { useFinanceDomain } from "./domains/useFinanceDomain";
import { useFuncionarioDomain } from "./domains/useFuncionarioDomain";
import { usePedidoDomain } from "./domains/usePedidoDomain";
import { useServicoDomain } from "./domains/useServicoDomain";
import { PERMISSOES, temPermissao } from "../auth/permissions";

export function AppProvider({ children }: { children: ReactNode }) {
    const [apiError, setApiError] = useState("");
    const reportError = useCallback((message: string) => setApiError(message), []);
    const auth = useAuthDomain(reportError);
    const authenticated = Boolean(auth.usuario);
    const cargo = auth.usuario?.cargo;
    const clientes = useClienteDomain(authenticated, reportError);
    const servicos = useServicoDomain(authenticated, reportError);
    const podeConsultarEstoque = Boolean(cargo && temPermissao(cargo, PERMISSOES.estoqueConsultar));
    const podeGerenciarFuncionarios = Boolean(
        cargo && temPermissao(cargo, PERMISSOES.funcionariosGerenciar)
    );
    const podeGerenciarDespesas = Boolean(
        cargo && temPermissao(cargo, PERMISSOES.despesasGerenciar)
    );
    const estoque = useEstoqueDomain(podeConsultarEstoque, reportError);
    const financeiro = useFinanceDomain(authenticated, podeGerenciarDespesas, reportError);
    const funcionarios = useFuncionarioDomain(
        podeGerenciarFuncionarios,
        auth.usuario?.cargo === "Dono",
        reportError
    );
    const pedidos = usePedidoDomain(
        authenticated,
        reportError,
        estoque.refreshInsumos,
        financeiro.refreshNotas
    );

    return (
        <AppContext.Provider
            value={{
                usuario: auth.usuario,
                carregandoSessao: auth.carregandoSessao,
                login: auth.login,
                logout: auth.logout,
                atualizarUsuario: auth.atualizarUsuario,
                clientes: clientes.clientes,
                servicos: servicos.servicos,
                insumos: estoque.insumos,
                pedidos: pedidos.pedidos,
                funcionarios: funcionarios.funcionarios,
                despesas: financeiro.despesas,
                notas: financeiro.notas,
                cadastrarCliente: clientes.cadastrarCliente,
                cadastrarServico: servicos.cadastrarServico,
                alterarServico: servicos.alterarServico,
                cadastrarInsumo: estoque.cadastrarInsumo,
                movimentarEstoque: estoque.movimentarEstoque,
                criarPedido: pedidos.criarPedido,
                moverEtapa: pedidos.moverEtapa,
                salvarDescricaoTecnica: pedidos.salvarDescricaoTecnica,
                cancelarPedido: pedidos.cancelarPedido,
                registrarPagamento: pedidos.registrarPagamento,
                finalizarPedido: pedidos.finalizarPedido,
                reenviarNota: financeiro.reenviarNota,
                registrarDespesa: financeiro.registrarDespesa,
                pagarDespesa: financeiro.pagarDespesa,
                cadastrarFuncionario: funcionarios.cadastrarFuncionario,
                atualizarFuncionario: funcionarios.atualizarFuncionario,
                excluirFuncionario: funcionarios.excluirFuncionario
            }}
        >
            {apiError && (
                <div className="erro-api" role="alert">
                    <span>{apiError}</span>
                    <button type="button" onClick={() => setApiError("")} aria-label="Fechar aviso">
                        ×
                    </button>
                </div>
            )}
            {children}
        </AppContext.Provider>
    );
}
