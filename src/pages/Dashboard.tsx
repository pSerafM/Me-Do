import { useState } from "react";
import GraficoLinha from "../components/GraficoLinha";
import GraficoRosca from "../components/GraficoRosca";
import { useApp } from "../hooks/useApp";
import {
    faturamentoPorDia,
    resumoDoMes,
    servicosMaisContratados,
    variacao
} from "../services/CalculoFinanceiro";
import { moeda } from "../utils/formatadores";

function mesAtual(): string {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

function Variacao({ valor, inverter }: { valor: number | null; inverter?: boolean }) {
    if (valor === null) {
        return <span className="variacao neutra">— sem mês anterior</span>;
    }

    const bom = inverter ? valor <= 0 : valor >= 0;

    return (
        <span className={`variacao ${bom ? "positiva" : "negativa"}`}>
            {valor >= 0 ? "▲" : "▼"} {valor >= 0 ? "+" : ""}
            {valor.toFixed(1).replace(".", ",")}%
        </span>
    );
}

function Dashboard() {
    const { pedidos } = useApp();
    const [periodo, setPeriodo] = useState(mesAtual());

    const [ano, mesNumero] = periodo.split("-").map(Number);
    const mes = mesNumero - 1;
    const anterior = new Date(ano, mes - 1, 1);

    const atual = resumoDoMes(pedidos, ano, mes);
    const passado = resumoDoMes(pedidos, anterior.getFullYear(), anterior.getMonth());

    const nomeMes = new Date(ano, mes, 1).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
    });

    const cartoes = [
        {
            rotulo: "FATURAMENTO TOTAL",
            valor: moeda(atual.faturamento),
            variacao: variacao(atual.faturamento, passado.faturamento)
        },
        {
            rotulo: "TICKET MÉDIO / OS",
            valor: moeda(atual.ticketMedio),
            variacao: variacao(atual.ticketMedio, passado.ticketMedio)
        },
        {
            rotulo: "OSs CONCLUÍDAS",
            valor: String(atual.osConcluidas),
            variacao: variacao(atual.osConcluidas, passado.osConcluidas)
        },
        {
            rotulo: "TEMPO MÉDIO",
            valor: `${atual.tempoMedioDias.toFixed(1).replace(".", ",")} dias`,
            variacao: variacao(atual.tempoMedioDias, passado.tempoMedioDias),
            inverter: true
        }
    ];

    return (
        <section className="painel">
            <div className="painel-titulo painel-titulo-linha">
                <h2>Métricas</h2>
                <label className="filtro-periodo">
                    <span>Período</span>
                    <input
                        type="month"
                        value={periodo}
                        onChange={(e) => e.target.value && setPeriodo(e.target.value)}
                    />
                </label>
            </div>

            <div className="painel-corpo">
                <div className="cartoes">
                    {cartoes.map((cartao) => (
                        <div className="cartao-metrica" key={cartao.rotulo}>
                            <span className="cartao-rotulo">{cartao.rotulo}</span>
                            <strong>{cartao.valor}</strong>
                            <Variacao valor={cartao.variacao} inverter={cartao.inverter} />
                        </div>
                    ))}
                </div>

                <div className="graficos">
                    <GraficoLinha
                        valores={faturamentoPorDia(pedidos, ano, mes)}
                        rotuloX={`${nomeMes} (dias do mês)`}
                    />
                    <GraficoRosca fatias={servicosMaisContratados(pedidos, ano, mes)} />
                </div>
            </div>
        </section>
    );
}

export default Dashboard;
