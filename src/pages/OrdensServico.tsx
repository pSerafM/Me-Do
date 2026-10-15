import { useState } from "react";
import DescricaoTecnicaModal from "../components/DescricaoTecnicaModal";
import LogModal from "../components/LogModal";
import { useApp } from "../hooks/useApp";
import Modal from "../components/Modal";
import { PERMISSOES, temPermissao } from "../auth/permissions";
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
    const { pedidos, moverEtapa, cancelarPedido, usuario } = useApp();
    const [idTecnica, setIdTecnica] = useState<number | null>(null);
    const [idLog, setIdLog] = useState<number | null>(null);
    const [idCancelando, setIdCancelando] = useState<number | null>(null);
    const [motivoCancelamento, setMotivoCancelamento] = useState("");
    const podeOperar = Boolean(
        usuario && temPermissao(usuario.cargo, PERMISSOES.pedidosOperar)
    );
    const podeVerLog = Boolean(
        usuario && temPermissao(usuario.cargo, PERMISSOES.pedidosVerLog)
    );

    const pedidoTecnica = pedidos.find((p) => p.id === idTecnica);
    const pedidoLog = pedidos.find((p) => p.id === idLog);

    // Os botões do Kanban chamam o domínio; só atualizam a tela após confirmação da API.
    async function mover(idPedido: number, direcao: 1 | -1) {
        const erro = await moverEtapa(idPedido, direcao);

        if (erro) {
            alert(erro);
        }
    }

    // Coleta o motivo antes de solicitar o cancelamento persistente.
    async function cancelar(idPedido: number) {
        const motivo = motivoCancelamento.trim();
        if (!motivo) {
            alert("Informe o motivo do cancelamento.");
            return;
        }
        const erro = await cancelarPedido(idPedido, motivo);
        if (erro) {
            alert(erro);
            return;
        }
        setIdCancelando(null);
        setMotivoCancelamento("");
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
                                                    {podeOperar && (
                                                        <button
                                                            type="button"
                                                            className="btn-icone"
                                                            title="Descrição técnica"
                                                            onClick={() => setIdTecnica(pedido.id)}
                                                        >
                                                            📄
                                                        </button>
                                                    )}
                                                    {podeVerLog && (
                                                        <button
                                                            type="button"
                                                            className="btn-icone"
                                                            title="Log de atendimento"
                                                            onClick={() => setIdLog(pedido.id)}
                                                        >
                                                            🕘
                                                        </button>
                                                    )}
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

                                            {podeOperar && (
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
                                            )}
                                            {pedido.etapa !== "cancelado" && pedido.etapa !== "retirado" && (
                                                <button
                                                    type="button"
                                                    className="btn btn-perigo-claro"
                                                    onClick={() => {
                                                        setIdCancelando(pedido.id);
                                                        setMotivoCancelamento("");
                                                    }}
                                                >
                                                    Cancelar pedido
                                                </button>
                                            )}
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
            {idCancelando !== null && (
                <Modal
                    titulo={`Cancelar pedido — OS #${idCancelando}`}
                    onFechar={() => setIdCancelando(null)}
                >
                    <div className="campo">
                        <label htmlFor="motivo-cancelamento">Motivo do cancelamento</label>
                        <textarea
                            id="motivo-cancelamento"
                            rows={3}
                            value={motivoCancelamento}
                            onChange={(event) => setMotivoCancelamento(event.target.value)}
                        />
                    </div>
                    <div className="acoes-form">
                        <button
                            type="button"
                            className="btn btn-perigo"
                            onClick={() => void cancelar(idCancelando)}
                        >
                            Confirmar cancelamento
                        </button>
                        <button
                            type="button"
                            className="btn btn-neutro"
                            onClick={() => setIdCancelando(null)}
                        >
                            Voltar
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}

export default OrdensServico;
