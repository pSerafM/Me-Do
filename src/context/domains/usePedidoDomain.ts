import { useCallback } from "react";
import { apiBody, apiErrorMessage, apiRequest } from "../../api/client";
import { reviverPedido, type ApiPedido } from "../../api/modelsFromApi";
import type { FormaPagamento, InsumoUsado, Progresso } from "../AppContext";
import type { Pedido } from "../../models/Pedido";
import { useCollection } from "./useCollection";

const ROTULOS_ETAPA: Record<string, string> = {
    aberto: "Em Aberto",
    analise: "Análise/ Orçamento",
    aguardando_insumo: "Aguardando Insumo",
    manutencao: "Em Manutenção",
    pronto_retirada: "Pronto para Retirada"
};

export function usePedidoDomain(
    authenticated: boolean,
    reportError: (message: string) => void,
    refreshInsumos: () => Promise<unknown>,
    refreshNotas: () => Promise<unknown>
) {
    const collection = useCollection<ApiPedido, Pedido>(
        "/pedidos",
        authenticated,
        reviverPedido,
        reportError
    );
    const { items, refresh } = collection;

    const criarPedido = useCallback(
        async (pedido: Pedido): Promise<Pedido> => {
            const row = await apiRequest<{ id: number }>("/pedidos", {
                method: "POST",
                body: apiBody({
                    clienteId: pedido.cliente.id,
                    servicoId: pedido.servico.id,
                    itens: pedido.itens.map((item) => ({
                        servicoId: item.servico.id,
                        modelo: item.modelo,
                        marca: item.marca,
                        numeroSerie: item.numeroSerie,
                        estado: item.estado,
                        observacao: item.observacao,
                        foto: item.foto
                    }))
                })
            });
            const pedidos = await refresh();
            const created = pedidos.find((item) => item.id === row.id);
            if (!created) throw new Error("Pedido salvo, mas não retornou na atualização.");
            return created;
        },
        [refresh]
    );

    const moverEtapa = useCallback(
        async (id: number, direcao: 1 | -1): Promise<string | null> => {
            const pedido = items.find((item) => item.id === id);
            if (!pedido) return "Pedido não encontrado.";
            const stages = Object.keys(ROTULOS_ETAPA);
            const position = stages.indexOf(pedido.etapa);
            const next = stages[position + direcao];
            if (!next) return null;
            if (direcao === 1 && position >= 1 && !pedido.laudoTecnico.trim()) {
                return "Preencha a descrição técnica (laudo) antes de avançar o pedido.";
            }
            try {
                await apiRequest(`/pedidos/${id}/etapa`, {
                    method: "PATCH",
                    body: apiBody({ direcao })
                });
                await refresh();
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [items, refresh]
    );

    const salvarDescricaoTecnica = useCallback(
        async (
            id: number,
            laudo: string,
            novosInsumos: InsumoUsado[],
            progresso: Progresso | null
        ): Promise<string | null> => {
            if (!laudo.trim()) return "Preencha o laudo técnico / parecer.";
            try {
                await apiRequest(`/pedidos/${id}/laudo`, {
                    method: "POST",
                    body: apiBody({ laudo: laudo.trim(), insumos: novosInsumos, progresso })
                });
                await Promise.all([refresh(), refreshInsumos()]);
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [refresh, refreshInsumos]
    );

    const cancelarPedido = useCallback(
        async (id: number, motivo: string): Promise<string | null> => {
            if (!motivo.trim()) return "Informe o motivo do cancelamento.";
            try {
                await apiRequest(`/pedidos/${id}/cancelamento`, {
                    method: "POST",
                    body: apiBody({ motivo })
                });
                await refresh();
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [refresh]
    );

    const registrarPagamento = useCallback(
        async (id: number, valor: number, forma: FormaPagamento): Promise<string | null> => {
            try {
                await apiRequest(`/pedidos/${id}/pagamentos`, {
                    method: "POST",
                    body: apiBody({ valor, forma })
                });
                await refresh();
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [refresh]
    );

    const finalizarPedido = useCallback(
        async (id: number, forma?: FormaPagamento): Promise<string | null> => {
            try {
                await apiRequest(`/pedidos/${id}/finalizacao`, {
                    method: "POST",
                    body: apiBody({ ...(forma ? { forma } : {}) })
                });
                await Promise.all([refresh(), refreshNotas()]);
                return null;
            } catch (error) {
                return apiErrorMessage(error);
            }
        },
        [refresh, refreshNotas]
    );

    return {
        pedidos: items,
        refreshPedidos: refresh,
        criarPedido,
        moverEtapa,
        salvarDescricaoTecnica,
        cancelarPedido,
        registrarPagamento,
        finalizarPedido
    };
}
