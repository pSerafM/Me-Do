import { useState } from "react";
import InsumoForm from "../components/InsumoForm";
import Modal from "../components/Modal";
import MovimentacaoModal from "../components/MovimentacaoModal";
import { useApp } from "../hooks/useApp";
import { moeda } from "../utils/formatadores";

function Estoque() {
    const { insumos, cadastrarInsumo } = useApp();
    const [busca, setBusca] = useState("");
    const [novoInsumo, setNovoInsumo] = useState(false);
    const [idMovimentando, setIdMovimentando] = useState<number | null>(null);

    const termo = busca.trim().toLowerCase();
    const lista = insumos.filter(
        (insumo) =>
            !termo ||
            insumo.nome.toLowerCase().includes(termo) ||
            insumo.sku.toLowerCase().includes(termo)
    );

    const insumoMovimentando = insumos.find((i) => i.id === idMovimentando);

    return (
        <>
            <section className="painel">
                <div className="painel-titulo painel-titulo-linha">
                    <h2>Controle de Estoque</h2>
                    <input
                        className="busca"
                        placeholder="Buscar Insumo"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                    <button type="button" className="btn btn-claro" onClick={() => setNovoInsumo(true)}>
                        + Novo Insumo
                    </button>
                </div>

                <div className="painel-corpo sem-padding">
                    <table className="tabela">
                        <thead>
                            <tr>
                                <th>Foto</th>
                                <th>SKU</th>
                                <th>Nome</th>
                                <th>Categoria</th>
                                <th>Preço de Custo</th>
                                <th>Quantidade Atual</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lista.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="vazio">
                                        Nenhum insumo cadastrado.
                                    </td>
                                </tr>
                            )}
                            {lista.map((insumo) => (
                                <tr key={insumo.id} className={insumo.abaixoDoMinimo() ? "alerta-estoque" : ""}>
                                    <td>📦</td>
                                    <td>{insumo.sku}</td>
                                    <td>{insumo.nome}</td>
                                    <td>{insumo.categoria}</td>
                                    <td>{moeda(insumo.precoCusto)}</td>
                                    <td>
                                        {insumo.quantidade} {insumo.unidade}
                                        {insumo.abaixoDoMinimo() && " ⚠ nível mínimo"}
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-primario btn-pequeno"
                                            title="Movimentar estoque"
                                            onClick={() => setIdMovimentando(insumo.id)}
                                        >
                                            +
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {novoInsumo && (
                <Modal titulo="Cadastro de Insumo" icone="+" onFechar={() => setNovoInsumo(false)}>
                    <InsumoForm
                        onInsumoCadastrado={async (insumo) => {
                            const erro = await cadastrarInsumo(insumo);
                            if (!erro) setNovoInsumo(false);
                            return erro;
                        }}
                    />
                </Modal>
            )}

            {insumoMovimentando && (
                <MovimentacaoModal
                    insumo={insumoMovimentando}
                    onFechar={() => setIdMovimentando(null)}
                />
            )}
        </>
    );
}

export default Estoque;
