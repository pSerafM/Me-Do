import { useState } from "react";
import Modal from "../components/Modal";
import ServicoForm from "../components/ServicoForm";
import { useApp } from "../hooks/useApp";
import { Servico } from "../models/Servico";
import { moeda } from "../utils/formatadores";

function GerenciaServicos() {
    const { servicos, pedidos, cadastrarServico, alterarServico } = useApp();
    const [idEditando, setIdEditando] = useState<number | null>(null);

    const servicoEditando = servicos.find((s) => s.id === idEditando);

    function pedidosAtivosDoServico(servico: Servico): number {
        return pedidos.filter(
            (pedido) =>
                pedido.etapa !== "retirado" &&
                pedido.etapa !== "cancelado" &&
                (pedido.itens.length > 0
                    ? pedido.itens.some((item) => item.servico.id === servico.id)
                    : pedido.servico.id === servico.id)
        ).length;
    }

    async function alternarStatus(servico: Servico) {
        if (servico.status) {
            const ativos = pedidosAtivosDoServico(servico);

            if (!window.confirm(`${ativos} pedido(s) ativo(s) usam "${servico.nome}". Inativar mesmo assim?`)) {
                return;
            }
        }

        const erro = await alterarServico(servico.id, { status: !servico.status });

        if (erro) {
            alert(erro);
        }
    }

    return (
        <>
            <section className="painel">
                <h2 className="painel-titulo">Novo Serviço</h2>

                <div className="painel-corpo">
                    <ServicoForm
                        rotuloBotao="Registrar"
                        limparAoSalvar
                        onSalvar={(dados) =>
                            cadastrarServico(
                                new Servico(
                                    Date.now(),
                                    dados.nome,
                                    dados.valor,
                                    dados.horasEstimadas,
                                    dados.descricao
                                )
                            )
                        }
                    />
                </div>
            </section>

            <section className="painel">
                <h2 className="painel-titulo">Serviços Registrados</h2>

                <div className="painel-corpo sem-padding">
                    <table className="tabela">
                        <thead>
                            <tr>
                                <th>Nome de Serviço</th>
                                <th>Valor Padrão</th>
                                <th>Tempo Estimado</th>
                                <th>Editar</th>
                                <th>Inativar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {servicos.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="vazio">
                                        Nenhum serviço registrado.
                                    </td>
                                </tr>
                            )}
                            {servicos.map((servico) => (
                                <tr key={servico.id} className={servico.status ? "" : "linha-inativa"}>
                                    <td>
                                        {servico.nome}
                                        {!servico.status && " (inativo)"}
                                    </td>
                                    <td>{moeda(servico.valor)}</td>
                                    <td>{servico.horasEstimadas}h</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-primario btn-pequeno"
                                            title="Editar"
                                            onClick={() => setIdEditando(servico.id)}
                                        >
                                            ✎
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-neutro btn-pequeno"
                                            title={servico.status ? "Inativar" : "Reativar"}
                                            onClick={() => alternarStatus(servico)}
                                        >
                                            {servico.status ? "⊖" : "⊕"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {servicoEditando && (
                <Modal titulo="Editar Serviço" icone="✎" onFechar={() => setIdEditando(null)}>
                    <ServicoForm
                        inicial={servicoEditando}
                        rotuloBotao="Salvar"
                        onSalvar={async (dados) => {
                            const erro = alterarServico(servicoEditando.id, dados);

                            if (!(await erro)) {
                                setIdEditando(null);
                            }

                            return erro;
                        }}
                    />

                    <button
                        type="button"
                        className="btn btn-neutro"
                        onClick={() => {
                            void alternarStatus(servicoEditando).then(() => setIdEditando(null));
                        }}
                    >
                        {servicoEditando.status ? "Desativar serviço" : "Ativar serviço"}
                    </button>
                </Modal>
            )}
        </>
    );
}

export default GerenciaServicos;
