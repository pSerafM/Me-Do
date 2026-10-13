import { useState } from "react";
import { useApp } from "../hooks/useApp";
import type { NotaFiscal as NotaFiscalModel, StatusNota } from "../models/NotaFiscal";

const STATUS: Record<StatusNota, { rotulo: string; cor: string }> = {
    com_erro: { rotulo: "Com Erro/Rejeitada", cor: "#C62B22" },
    autorizada: { rotulo: "Autorizada", cor: "#4C9A2A" },
    em_processamento: { rotulo: "Em Processamento", cor: "#E0CF4A" },
    cancelada: { rotulo: "Cancelada", cor: "#9A9A9A" }
};

// Arquivo de exemplo até existir integração com o emissor de verdade.
function baixarXml(nota: NotaFiscalModel) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<notaFiscal>
  <numero>${nota.numero}</numero>
  <serie>${nota.serie}</serie>
  <pedido>${nota.idPedido}</pedido>
  <chaveAcesso>${nota.chaveAcesso}</chaveAcesso>
  <emissao>${nota.dataEmissao.toISOString()}</emissao>
</notaFiscal>`;

    const url = URL.createObjectURL(new Blob([xml], { type: "application/xml" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `NF-${nota.numero}.xml`;
    link.click();
    URL.revokeObjectURL(url);
}

function NotaFiscal() {
    const { notas, reenviarNota } = useApp();
    const [busca, setBusca] = useState("");

    const lista = notas.filter((n) => !busca.trim() || String(n.idPedido) === busca.trim());

    return (
        <section className="painel">
            <div className="painel-titulo painel-titulo-linha">
                <h2>Status de Emissão</h2>
                <input
                    className="busca"
                    placeholder="Buscar OS"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </div>

            <div className="painel-corpo sem-padding">
                <table className="tabela">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Nº da OS</th>
                            <th>Erro</th>
                            <th>Reenviar</th>
                            <th>Download XML/PDF</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lista.length === 0 && (
                            <tr>
                                <td colSpan={5} className="vazio">
                                    As notas aparecem aqui depois do checkout dos pedidos.
                                </td>
                            </tr>
                        )}
                        {lista.map((nota) => (
                            <tr key={nota.idNotaFiscal}>
                                <td>
                                    <span className="status">
                                        <span
                                            className="ponto"
                                            style={{ background: STATUS[nota.status].cor }}
                                        />
                                        {STATUS[nota.status].rotulo}
                                    </span>
                                </td>
                                <td>#{nota.idPedido}</td>
                                <td>{nota.mensagemErro}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-navy btn-pequeno"
                                        disabled={nota.status !== "com_erro"}
                                        onClick={async () => {
                                            const erro = await reenviarNota(nota.idNotaFiscal);
                                            if (erro) alert(erro);
                                        }}
                                    >
                                        ➤
                                    </button>
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-primario btn-pequeno"
                                        disabled={nota.status !== "autorizada"}
                                        onClick={() => baixarXml(nota)}
                                    >
                                        ⬇
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default NotaFiscal;
