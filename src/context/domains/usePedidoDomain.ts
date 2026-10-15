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
    // useCollection carrega GET /pedidos ao autenticar e converte cada resposta em um modelo Pedido.
    const collection = useCollection<ApiPedido, Pedido>(
        "/pedidos",
        authenticated,
        reviverPedido,
        reportError
    );
    const { items, refresh } = collection;

    // Criação: envia somente IDs e dados de cada item; o servidor calcula valores e grava as relações.
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
            // A API devolve o ID; recarregar obtém o pedido completo com logs, pagamentos e dados relacionados.
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
            // Validação antecipada dá retorno rápido; a API repete as regras antes de gravar.
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
                // Laudo, progresso e novos insumos são enviados juntos para a API processar atomicamente.
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
                // O motivo é persistido junto à etapa cancelada e ao registro de log.
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
                // Cada entrada é registrada como pagamento próprio; a API verifica o saldo restante.
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
                // Finalização pode registrar o saldo final, encerrar o pedido e criar a nota fiscal.
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
