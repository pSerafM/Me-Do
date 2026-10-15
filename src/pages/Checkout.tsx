import { useState } from "react";
import PagamentoModal from "../components/PagamentoModal";
import { useApp } from "../hooks/useApp";
import type { FormaPagamento } from "../context/AppContext";
import { moeda } from "../utils/formatadores";

function Checkout() {
    const { pedidos, finalizarPedido } = useApp();
    const [busca, setBusca] = useState("");
    const [idPagando, setIdPagando] = useState<number | null>(null);

    // Mostra pedidos prontos para retirada e cancelados ainda não encerrados no checkout.
    const lista = pedidos
        .filter((p) => p.etapa === "pronto_retirada" || (p.etapa === "cancelado" && !p.encerrado))
        .filter((p) => !busca.trim() || String(p.id) === busca.trim());

    const pedidoPagando = pedidos.find((p) => p.id === idPagando);

    function rotuloPagamento(idPedido: number): string {
        const pedido = pedidos.find((p) => p.id === idPedido)!;

        if (pedido.etapa === "cancelado") return "Cancelado";
        if (pedido.pagamentos.length === 0) return "Pendente";
        return pedido.saldo() > 0.005 ? "Entrada" : "Pago";
    }

    // A API valida o saldo, registra eventual pagamento final e encerra a OS.
    async function finalizar(idPedido: number, forma?: FormaPagamento) {
        const erro = await finalizarPedido(idPedido, forma);

        if (erro) {
            alert(erro);
            return;
        }

        setIdPagando(null);
    }

    function aoClicarFinalizar(idPedido: number) {
        const pedido = pedidos.find((p) => p.id === idPedido)!;

        if (pedido.etapa !== "cancelado" && pedido.saldo() > 0.005) {
            setIdPagando(idPedido);
            return;
        }

        finalizar(idPedido);
    }

    return (
        <>
            <section className="painel">
                <div className="painel-titulo painel-titulo-linha">
                    <h2>Pedidos Concluídos</h2>
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
                                <th>OS</th>
                                <th>Pagamento</th>
                                <th>Valor</th>
                                <th>Saldo</th>
                                <th>Cliente</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lista.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="vazio">
                                        Nenhum pedido pronto para retirada.
                                    </td>
                                </tr>
                            )}
                            {lista.map((pedido) => (
                                <tr key={pedido.id}>
                                    <td>#{pedido.id}</td>
                                    <td>{rotuloPagamento(pedido.id)}</td>
                                    <td>{moeda(pedido.valorTotal)}</td>
                                    <td>{pedido.etapa === "cancelado" ? "—" : moeda(pedido.saldo())}</td>
                                    <td>{pedido.cliente.nome}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-primario btn-pequeno"
                                            onClick={() => aoClicarFinalizar(pedido.id)}
                                        >
                                            Finalizar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {pedidoPagando && (
                <PagamentoModal
                    titulo="Pagamento na Retirada"
                    valorInicial={pedidoPagando.saldo()}
                    valorTravado
                    onConfirmar={(_valor, forma) => finalizar(pedidoPagando.id, forma)}
                    onFechar={() => setIdPagando(null)}
                />
            )}
        </>
    );
}

export default Checkout;
