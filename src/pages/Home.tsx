import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import type { EtapaOS } from "../models/Pedido";

const ATALHOS = [
    { icone: "▥", rotulo: "Iniciar Atendimento", para: "/app/atendimento" },
    { icone: "🔧", rotulo: "Ordens de Serviço", para: "/app/ordens-servico" },
    { icone: "$", rotulo: "Financeiro e Estoque", para: "/app/financeiro" },
    { icone: "📊", rotulo: "Dashboards e Gestão", para: "/app/gestao" }
];

function Home() {
    const { pedidos } = useApp();
    const navigate = useNavigate();

    const contar = (...etapas: EtapaOS[]) =>
        pedidos.filter((pedido) => etapas.includes(pedido.etapa)).length;

    const contadores = [
        { rotulo: "Pedidos em Aberto", valor: contar("aberto", "analise") },
        { rotulo: "Pedidos em Andamento", valor: contar("aguardando_insumo", "manutencao") },
        { rotulo: "Pedidos Finalizados", valor: contar("pronto_retirada") },
        { rotulo: "Pedidos Retirados", valor: contar("retirado") }
    ];

    return (
        <>
            <section className="painel">
                <h2 className="painel-titulo">Painel de Controle</h2>
                <div className="painel-corpo contadores">
                    {contadores.map((c) => (
                        <div className="contador" key={c.rotulo}>
                            <span>{c.rotulo}</span>
                            <strong>{c.valor}</strong>
                        </div>
                    ))}
                </div>
            </section>

            <section className="atalhos">
                {ATALHOS.map((atalho) => (
                    <button
                        key={atalho.para}
                        type="button"
                        className="atalho"
                        onClick={() => navigate(atalho.para)}
                    >
                        <span className="atalho-icone">{atalho.icone}</span>
                        {atalho.rotulo}
                    </button>
                ))}
            </section>
        </>
    );
}

export default Home;
