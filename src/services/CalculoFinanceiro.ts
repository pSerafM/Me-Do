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

function noMes(data: Date | null, ano: number, mes: number): boolean {
    return !!data && data.getFullYear() === ano && data.getMonth() === mes;
}

export function resumoDoMes(pedidos: Pedido[], ano: number, mes: number): ResumoMensal {
    const validos = pedidos.filter((pedido) => pedido.etapa !== "cancelado");

    const faturamento = validos
        .flatMap((pedido) => pedido.pagamentos)
        .filter((pagamento) => noMes(pagamento.dataPagamento, ano, mes))
        .reduce((total, pagamento) => total + pagamento.valorPago, 0);

    const concluidas = validos.filter((pedido) =>
        noMes(pedido.dataConclusao, ano, mes)
    );

    const somaValores = concluidas.reduce((t, p) => t + p.valorTotal, 0);
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
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const valores: number[] = new Array(diasNoMes).fill(0);

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
    const contagem = new Map<string, number>();

    pedidos
        .filter(
            (pedido) =>
                pedido.etapa !== "cancelado" && noMes(pedido.dataAbertura, ano, mes)
        )
        .forEach((pedido) => {
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
    const principais = ordenadas.slice(0, 3);
    const outros = ordenadas.slice(3).reduce((soma, [, valor]) => soma + valor, 0);

    const fatias = principais.map(([nome, quantidade]) => ({
        nome,
        quantidade,
        percentual: (quantidade / total) * 100
    }));

    if (outros > 0) {
        fatias.push({
            nome: "Outros",
            quantidade: outros,
            percentual: (outros / total) * 100
        });
    }

    return fatias;
}

// Compara um indicador atual com o anterior; null sinaliza que falta base para comparar.
export function variacao(atual: number, anterior: number): number | null {
    if (anterior <= 0) {
        return null;
    }

    // Calcula a diferença relativa à base anterior e retorna o percentual.
    return ((atual - anterior) / anterior) * 100;
}
