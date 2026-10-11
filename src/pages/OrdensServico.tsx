import { useState } from "react";
import DescricaoTecnicaModal from "../components/DescricaoTecnicaModal";
import LogModal from "../components/LogModal";
import { useApp } from "../hooks/useApp";
import type { EtapaOS } from "../models/Pedido";
import { ROTULO_ETAPA } from "../models/Pedido";
import { prazoRestante } from "../utils/formatadores";

const COLUNAS: { etapa: EtapaOS; classe: string }[] = [
    { etapa: "aberto", classe: "col-aberto" },
    { etapa: "analise", classe: "col-analise" },
    { etapa: "aguardando_insumo", classe: "col-aguardando" },
    { etapa: "manutencao", classe: "col-manutencao" },
    { etapa: "pronto_retirada", classe: "col-pronto" }
];

function OrdensServico() {
    const { pedidos, moverEtapa } = useApp();
    const [idTecnica, setIdTecnica] = useState<number | null>(null);
    const [idLog, setIdLog] = useState<number | null>(null);

    const pedidoTecnica = pedidos.find((p) => p.id === idTecnica);
    const pedidoLog = pedidos.find((p) => p.id === idLog);

    function mover(idPedido: number, direcao: 1 | -1) {
        const erro = moverEtapa(idPedido, direcao);

        if (erro) {
            alert(erro);
        }
    }

    return (
        <>
            <div className="kanban">
                {COLUNAS.map((coluna) => {
                    const cards = pedidos.filter((p) => p.etapa === coluna.etapa);

                    return (
                        <section className={`coluna ${coluna.classe}`} key={coluna.etapa}>
                            <h2 className="coluna-titulo">{ROTULO_ETAPA[coluna.etapa]}</h2>

                            <div className="coluna-corpo">
                                {cards.map((pedido) => {
                                    const prazo = prazoRestante(pedido.dataPrevisao);
                                    const primeiro = pedido.itens[0];
                                    const extras = pedido.itens.length - 1;

                                    return (
                                        <article className="os-card" key={pedido.id}>
                                            <div className="os-topo">
                                                <strong>Nº {pedido.id}</strong>
                                                <span>
                                                    <button
                                                        type="button"
                                                        className="btn-icone"
                                                        title="Descrição técnica"
                                                        onClick={() => setIdTecnica(pedido.id)}
                                                    >
                                                        📄
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-icone"
                                                        title="Log de atendimento"
                                                        onClick={() => setIdLog(pedido.id)}
                                                    >
                                                        🕘
                                                    </button>
                                                </span>
                                            </div>

                                            <span>{pedido.cliente.nome}</span>
                                            <span>
                                                {primeiro
                                                    ? `${primeiro.modelo} — ${primeiro.servico.nome}`
                                                    : pedido.servico.nome}
                                                {extras > 0 && ` (+${extras})`}
                                            </span>
                                            <span className={prazo.atrasado ? "tag-prazo atrasado" : "tag-prazo"}>
                                                {prazo.texto}
                                            </span>

                                            <div className="os-setas">
                                                <button
                                                    type="button"
                                                    className="btn-icone"
                                                    title="Etapa anterior"
                                                    disabled={coluna.etapa === "aberto"}
                                                    onClick={() => mover(pedido.id, -1)}
                                                >
                                                    ◀
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-icone"
                                                    title="Próxima etapa"
                                                    disabled={coluna.etapa === "pronto_retirada"}
                                                    onClick={() => mover(pedido.id, 1)}
                                                >
                                                    ▶
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>

            {pedidoTecnica && (
                <DescricaoTecnicaModal pedido={pedidoTecnica} onFechar={() => setIdTecnica(null)} />
            )}

            {pedidoLog && <LogModal pedido={pedidoLog} onFechar={() => setIdLog(null)} />}
        </>
    );
}

export default OrdensServico;
