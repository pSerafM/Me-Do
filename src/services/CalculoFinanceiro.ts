import type { Pedido } from "../models/Pedido";

export interface ResumoMensal {
    faturamento: number;
    ticketMedio: number;
    osConcluidas: number;
    tempoMedioDias: number;
}

export interface FatiaServico {
    nome: string;
    quantidade: number;
    percentual: number;
}

// Verifica se a data pertence ao mês e ano especificados.
function noMes(data: Date | null, ano: number, mes: number): boolean {
    return !!data && data.getFullYear() === ano && data.getMonth() === mes;
}

export function resumoDoMes(pedidos: Pedido[], ano: number, mes: number): ResumoMensal {
    // Pedidos cancelados não entram nos indicadores financeiros.
    const validos = pedidos.filter((pedido) => pedido.etapa !== "cancelado");

    // Soma os pagamentos realizados no período selecionado.
    const faturamento = validos
        .flatMap((pedido) => pedido.pagamentos)
        .filter((pagamento) => noMes(pagamento.dataPagamento, ano, mes))
        .reduce((total, pagamento) => total + pagamento.valorPago, 0);

    // Seleciona apenas os pedidos concluídos no período para calcular ticket médio e tempo médio.
    const concluidas = validos.filter((pedido) =>
        noMes(pedido.dataConclusao, ano, mes)
    );

    const somaValores = concluidas.reduce((t, p) => t + p.valorTotal, 0);

    // Calcula a duração total dos pedidos concluídos, em dias.
    const somaDias = concluidas.reduce(
        (t, p) =>
            t + (p.dataConclusao!.getTime() - p.dataAbertura.getTime()) / 86_400_000,
        0
    );

    return {
        faturamento,
        ticketMedio: concluidas.length ? somaValores / concluidas.length : 0,
        osConcluidas: concluidas.length,
        tempoMedioDias: concluidas.length ? somaDias / concluidas.length : 0
    };
}

export function faturamentoPorDia(pedidos: Pedido[], ano: number, mes: number): number[] {
    // Descobre quantos dias existem no mês selecionado.
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const valores: number[] = new Array(diasNoMes).fill(0);

    // Agrupa  os pagamentos pelo dia em que foram realizados.
    pedidos
        .filter((pedido) => pedido.etapa !== "cancelado")
        .flatMap((pedido) => pedido.pagamentos)
        .filter((pagamento) => noMes(pagamento.dataPagamento, ano, mes))
        .forEach((pagamento) => {
            valores[pagamento.dataPagamento.getDate() - 1] += pagamento.valorPago;
        });

    return valores;
}

export function servicosMaisContratados(
    pedidos: Pedido[],
    ano: number,
    mes: number
): FatiaServico[] {
    // Armazena a quantidade de ocorrências de cada pedido.
    const contagem = new Map<string, number>();

    pedidos
        .filter(
            (pedido) =>
                pedido.etapa !== "cancelado" && noMes(pedido.dataAbertura, ano, mes)
        )
        .forEach((pedido) => {
            // Considera os itens do pedido ou, se não houver itens
            const servicos =
                pedido.itens.length > 0
                    ? pedido.itens.map((item) => item.servico)
                    : [pedido.servico];

            servicos.forEach((servico) => {
                contagem.set(servico.nome, (contagem.get(servico.nome) ?? 0) + 1);
            });
        });

    const total = [...contagem.values()].reduce((soma, valor) => soma + valor, 0);
    const ordenadas = [...contagem.entries()].sort((a, b) => b[1] - a[1]);

    // Separa os três serviços mais contratados e agrupa o restante como "Outros".
    const principais = ordenadas.slice(0, 3);
    const outros = ordenadas.slice(3).reduce((soma, [, valor]) => soma + valor, 0);

    const fatias = principais.map(([nome, quantidade]) => ({
        nome,
        quantidade,
        percentual: (quantidade / total) * 100
    }));

    // Agrupa os serviços restantes em uma única categoria.
    if (outros > 0) {
        fatias.push({
            nome: "Outros",
            quantidade: outros,
            percentual: (outros / total) * 100
        });
    }

    return fatias;
}

// Variação percentual em relação ao mês anterior (null quando não há base).
export function variacao(atual: number, anterior: number): number | null {
    if (anterior <= 0) {
        return null;
    }

    return ((atual - anterior) / anterior) * 100;
}
