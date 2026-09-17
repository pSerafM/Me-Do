import { useState } from "react";
import ClienteForm from "./components/ClienteForm";
import ServicoForm from "./components/ServicoForm";
import { Cliente } from "./models/Cliente";
import { Servico } from "./models/Servico";
import PedidoForm from "./components/PedidoForm";
import InsumoForm from "./components/InsumoForm";
import { Pedido } from "./models/Pedido";
import "./App.css";
import type { Insumo } from "./models/Insumo";
import { Estoque } from "./models/Estoque";
import { ProcessarPedidoComum } from "./services/ProcessarPedidoComum";

const processadorPedido = new ProcessarPedidoComum();

function App() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const estoque = Estoque.getInstancia();

    function cadastrarCliente(cliente: Cliente) {
        setClientes((clientesAtuais) => [
            ...clientesAtuais,
            cliente
        ]);
    }

    function cadastrarServico(servico: Servico) {
        setServicos((servicosAtuais) => [
            ...servicosAtuais,
            servico
        ]);
    }

    function cadastrarInsumo(insumo: Insumo) {
        estoque.adicionarInsumo(insumo);
        setInsumos(estoque.listarInsumos());
    }

    function criarPedido(pedido: Pedido) {
        const pedidoProcessado = processadorPedido.processar(pedido);

        setPedidos((pedidosAtuais) => [
            ...pedidosAtuais,
            pedidoProcessado
        ]);
    }

    return (
        <div className="app">
            <header>
                <h1>MeDo</h1>
                <p>Sistema de gerenciamento de serviços</p>
            </header>

            <main>
                <section className="card">
                    <h2>Cadastrar Cliente</h2>

                    <ClienteForm
                        onClienteCadastrado={cadastrarCliente}
                    />
                </section>

                <section className="card">
                    <h2>Cadastrar Insumo</h2>

                    <InsumoForm
                        onInsumoCadastrado={cadastrarInsumo}
                    />
                </section>

                <section className="card">
                    <h2>Estoque</h2>

                    {insumos.length === 0 ? (
                        <p className="empty-message">
                            Nenhum insumo cadastrado.
                        </p>
                    ) : (
                        <div className="clientes-lista">
                            {insumos.map((insumo) => (
                                <div
                                    className="cliente-item"
                                    key={insumo.id}
                                >
                                    <h3>{insumo.nome}</h3>

                                    <p>
                                        <strong>Quantidade:</strong>{" "}
                                        {insumo.quantidade} {insumo.unidade}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="card">
                    <h2>Clientes cadastrados</h2>

                    {clientes.length === 0 ? (
                        <p className="empty-message">
                            Nenhum cliente cadastrado.
                        </p>
                    ) : (
                        <div className="clientes-lista">
                            {clientes.map((cliente) => (
                                <div
                                    className="cliente-item"
                                    key={cliente.id}
                                >
                                    <h3>{cliente.nome}</h3>

                                    <p>
                                        <strong>CPF/CNPJ:</strong>{" "}
                                        {cliente.cpfCnpj}
                                    </p>

                                    <p>
                                        <strong>Telefone:</strong>{" "}
                                        {cliente.telefone}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="card">
                    <h2>Cadastrar Serviço</h2>

                    <ServicoForm
                        onServicoCadastrado={cadastrarServico}
                    />
                </section>

                <section className="card">
                    <h2>Serviços cadastrados</h2>

                    {servicos.length === 0 ? (
                        <p className="empty-message">
                            Nenhum serviço cadastrado.
                        </p>
                    ) : (
                        <div className="clientes-lista">
                            {servicos.map((servico) => (
                                <div
                                    className="cliente-item"
                                    key={servico.id}
                                >
                                    <h3>{servico.nome}</h3>

                                    <p>
                                        <strong>Valor:</strong>{" "}
                                        R$ {servico.valor.toFixed(2)}
                                    </p>

                                    <p>
                                        <strong>
                                            Horas estimadas:
                                        </strong>{" "}
                                        {servico.horasEstimadas}h
                                    </p>

                                    <p>
                                        <strong>Status:</strong>{" "}
                                        {servico.status
                                            ? "Ativo"
                                            : "Inativo"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="card">
                    <h2>Criar Pedido</h2>

                    <PedidoForm
                        clientes={clientes}
                        servicos={servicos}
                        onPedidoCriado={criarPedido}
                    />
                </section>
                <section className="card">
                    <h2>Pedidos</h2>

                    {pedidos.length === 0 ? (
                        <p className="empty-message">
                            Nenhum pedido criado.
                        </p>
                    ) : (
                        <div className="clientes-lista">
                            {pedidos.map((pedido) => (
                                <div
                                    className="cliente-item"
                                    key={pedido.id}
                                >
                                    <h3>Pedido #{pedido.id}</h3>

                                    <p>
                                        <strong>Cliente:</strong>{" "}
                                        {pedido.cliente.nome}
                                    </p>

                                    <p>
                                        <strong>Serviço:</strong>{" "}
                                        {pedido.servico.nome}
                                    </p>

                                    <p>
                                        <strong>Valor:</strong>{" "}
                                        R$ {pedido.valorTotal.toFixed(2)}
                                    </p>

                                    <p>
                                        <strong>Status:</strong>{" "}
                                        {pedido.status}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}

export default App;