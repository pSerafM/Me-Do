import { useState } from "react";
import Modal from "./Modal";
import LogModal from "./LogModal";
import { useApp } from "../hooks/useApp";
import type { InsumoUsado, Progresso } from "../context/AppContext";
import type { Pedido } from "../models/Pedido";

const PASSOS: { id: Progresso; rotulo: string; cor: string }[] = [
    { id: "iniciar", rotulo: "Iniciar Reparo", cor: "#A9A9A9" },
    { id: "pausa", rotulo: "Pausa por Falta de Peça", cor: "#A992CC" },
    { id: "concluir", rotulo: "Concluir Reparo", cor: "#CDC283" },
    { id: "pronto", rotulo: "Pronto para Retirada", cor: "#7FA0E6" }
];

interface DescricaoTecnicaModalProps {
    pedido: Pedido;
    onFechar: () => void;
}

function DescricaoTecnicaModal({ pedido, onFechar }: DescricaoTecnicaModalProps) {
    const { insumos, salvarDescricaoTecnica, cancelarPedido } = useApp();

    const [laudo, setLaudo] = useState(pedido.laudoTecnico);
    const [buscaInsumo, setBuscaInsumo] = useState("");
    const [novos, setNovos] = useState<InsumoUsado[]>([]);
    const [progresso, setProgresso] = useState<Progresso | null>(null);
    const [cancelando, setCancelando] = useState(false);
    const [motivo, setMotivo] = useState("");
    const [verLog, setVerLog] = useState(false);

    const descricaoCliente = pedido.itens
        .map(
            (item) =>
                `${item.servico.nome} — ${item.modelo}${item.marca ? ` (${item.marca})` : ""}: ${
                    item.observacao || "sem observações"
                }`
        )
        .join("\n");

    function adicionarInsumo() {
        const termo = buscaInsumo.trim().toLowerCase();

        const encontrado = insumos.find(
            (insumo) =>
                `${insumo.id} - ${insumo.nome}`.toLowerCase() === termo ||
                insumo.nome.toLowerCase() === termo ||
                insumo.sku.toLowerCase() === termo
        );

        if (!encontrado) {
            alert("Insumo não encontrado no estoque.");
            return;
        }

        if (novos.some((n) => n.idInsumo === encontrado.id)) {
            alert("Esse insumo já foi adicionado.");
            return;
        }

        setNovos([...novos, { idInsumo: encontrado.id, quantidade: 1 }]);
        setBuscaInsumo("");
    }

    function alterarQuantidade(idInsumo: number, quantidade: number) {
        setNovos(novos.map((n) => (n.idInsumo === idInsumo ? { ...n, quantidade } : n)));
    }

    // Envia laudo, insumos e progresso em uma operação; o hook atualiza pedido e estoque ao concluir.
    async function salvar() {
        const erro = await salvarDescricaoTecnica(pedido.id, laudo, novos, progresso);

        if (erro) {
            alert(erro);
            return;
        }

        onFechar();
    }

    // O modal só recolhe o motivo; o servidor faz a mudança de etapa e grava o log.
    async function confirmarCancelamento() {
        const erro = await cancelarPedido(pedido.id, motivo);

        if (erro) {
            alert(erro);
            return;
        }

        onFechar();
    }

    if (verLog) {
        return <LogModal pedido={pedido} onFechar={() => setVerLog(false)} />;
    }

    return (
        <Modal titulo={`Descrição Técnica — OS #${pedido.id}`} largura="larga" onFechar={onFechar}>
            <div className="campo">
                <label>Descrição do Cliente</label>
                <textarea readOnly rows={3} value={descricaoCliente} />
            </div>

            <div className="campo">
                <label>Laudo Técnico / Parecer</label>
                <textarea
                    rows={3}
                    value={laudo}
                    placeholder="Aqui o técnico descreve o processo de reparo"
                    onChange={(e) => setLaudo(e.target.value)}
                />
            </div>

            <div className="bloco-insumos">
                <h3>Adicionar Insumos</h3>

                <div className="busca-insumo">
                    <input
                        list="lista-insumos"
                        value={buscaInsumo}
                        placeholder="Buscar insumo por nome, ID ou SKU"
                        onChange={(e) => setBuscaInsumo(e.target.value)}
                    />
                    <datalist id="lista-insumos">
                        {insumos.map((insumo) => (
                            <option key={insumo.id} value={`${insumo.id} - ${insumo.nome}`} />
                        ))}
                    </datalist>
                    <button type="button" className="btn btn-primario" onClick={adicionarInsumo}>
                        +
                    </button>
                </div>

                <table className="tabela">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Estoque</th>
                            <th>Quant.</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedido.insumosUsados.map((usado) => {
                            const insumo = insumos.find((i) => i.id === usado.idInsumo);
                            return (
                                <tr key={usado.idItemInsumo} className="linha-fixa">
                                    <td>{usado.idInsumo}</td>
                                    <td>{insumo?.nome ?? "—"}</td>
                                    <td>{insumo?.quantidade ?? "—"}</td>
                                    <td>{usado.quantidadeUsada} (já usado)</td>
                                    <td></td>
                                </tr>
                            );
                        })}

                        {novos.map((novo) => {
                            const insumo = insumos.find((i) => i.id === novo.idInsumo);
                            return (
                                <tr key={novo.idInsumo}>
                                    <td>{novo.idInsumo}</td>
                                    <td>{insumo?.nome}</td>
                                    <td>{insumo?.quantidade}</td>
                                    <td>
                                        <input
                                            className="entrada-pequena"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={novo.quantidade}
                                            onChange={(e) =>
                                                alterarQuantidade(novo.idInsumo, Number(e.target.value))
                                            }
                                        />
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn-icone"
                                            title="Remover"
                                            onClick={() =>
                                                setNovos(novos.filter((n) => n.idInsumo !== novo.idInsumo))
                                            }
                                        >
                                            🗑
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}

                        {pedido.insumosUsados.length === 0 && novos.length === 0 && (
                            <tr>
                                <td colSpan={5} className="vazio">
                                    Nenhum insumo adicionado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="progresso">
                <h3>Progresso</h3>
                <div className="progresso-linha">
                    {PASSOS.map((passo) => (
                        <button
                            key={passo.id}
                            type="button"
                            className={`passo ${progresso === passo.id ? "passo-ativo" : ""}`}
                            onClick={() => setProgresso(progresso === passo.id ? null : passo.id)}
                        >
                            <span className="passo-bolinha" style={{ background: passo.cor }} />
                            <span className="passo-rotulo">{passo.rotulo}</span>
                        </button>
                    ))}
                </div>
            </div>

            {cancelando ? (
                <div className="campo">
                    <label>Motivo do cancelamento</label>
                    <textarea rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                    <div className="acoes-form">
                        <button type="button" className="btn btn-perigo" onClick={confirmarCancelamento}>
                            Confirmar cancelamento
                        </button>
                        <button type="button" className="btn btn-neutro" onClick={() => setCancelando(false)}>
                            Voltar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="acoes-form">
                    <button type="button" className="btn btn-verde-claro" onClick={salvar}>
                        Salvar
                    </button>
                    <button type="button" className="btn btn-neutro" onClick={() => setVerLog(true)}>
                        Ver log
                    </button>
                    <button type="button" className="btn btn-perigo-claro" onClick={() => setCancelando(true)}>
                        Cancelar pedido
                    </button>
                </div>
            )}
        </Modal>
    );
}

export default DescricaoTecnicaModal;
