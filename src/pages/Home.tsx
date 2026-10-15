import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import type { EtapaOS } from "../models/Pedido";
import { PERMISSOES, temPermissao } from "../auth/permissions";

const ATALHOS = [
    { icone: "▥", rotulo: "Iniciar Atendimento", para: "/app/atendimento", permissao: PERMISSOES.pedidosCriar },
    { icone: "🔧", rotulo: "Ordens de Serviço", para: "/app/ordens-servico", permissao: PERMISSOES.pedidosConsultar },
    { icone: "$", rotulo: "Financeiro e Estoque", para: "/app/financeiro", permissao: PERMISSOES.checkout },
    { icone: "📊", rotulo: "Dashboards e Gestão", para: "/app/gestao", permissao: PERMISSOES.funcionariosGerenciar }
];

function Home() {
    const { pedidos, usuario } = useApp();
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
                {usuario && ATALHOS.filter((atalho) =>
                    temPermissao(usuario.cargo, atalho.permissao)
                ).map((atalho) => (
                    <button
                        key={atalho.para}
                        type="button"
                        className="atalho"
                        onClick={() => navigate(atalho.para)}
                    >
                        <span className="atalho-icone">{atalho.icone}</span>
                        {atalho.para === "/app/financeiro" &&
                        temPermissao(usuario!.cargo, PERMISSOES.estoqueGerenciar)
                            ? "Financeiro e Estoque"
                            : atalho.para === "/app/gestao" && usuario.cargo !== "Dono"
                              ? "Gestão de Funcionários"
                              : atalho.rotulo}
                    </button>
                ))}
            </section>
        </>
    );
}

export default Home;
