import { useState } from "react";
import type { FormEvent } from "react";
import { Cliente } from "../models/Cliente";
import { Servico } from "../models/Servico";
import { Pedido } from "../models/Pedido";

interface PedidoFormProps {
    clientes: Cliente[];
    servicos: Servico[];
    onPedidoCriado: (pedido: Pedido) => void;
}

function PedidoForm({
    clientes,
    servicos,
    onPedidoCriado
}: PedidoFormProps) {
    const [clienteId, setClienteId] = useState("");
    const [servicoId, setServicoId] = useState("");

    function criarPedido(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!clienteId || !servicoId) {
            alert("Selecione um cliente e um serviço.");
            return;
        }

        const cliente = clientes.find(
            (cliente) => cliente.id === Number(clienteId)
        );

        const servico = servicos.find(
            (servico) => servico.id === Number(servicoId)
        );

        if (!cliente || !servico) {
            alert("Cliente ou serviço não encontrado.");
            return;
        }

        const novoPedido = new Pedido(
            Date.now(),
            cliente,
            servico
        );

        onPedidoCriado(novoPedido);

        setClienteId("");
        setServicoId("");
    }

    return (
        <form className="cliente-form" onSubmit={criarPedido}>
            <div className="form-group">
                <label htmlFor="clientePedido">
                    Cliente
                </label>

                <select
                    id="clientePedido"
                    value={clienteId}
                    onChange={(event) =>
                        setClienteId(event.target.value)
                    }
                >
                    <option value="">
                        Selecione um cliente
                    </option>

                    {clientes.map((cliente) => (
                        <option
                            key={cliente.id}
                            value={cliente.id}
                        >
                            {cliente.nome}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="servicoPedido">
                    Serviço
                </label>

                <select
                    id="servicoPedido"
                    value={servicoId}
                    onChange={(event) =>
                        setServicoId(event.target.value)
                    }
                >
                    <option value="">
                        Selecione um serviço
                    </option>

                    {servicos.map((servico) => (
                        <option
                            key={servico.id}
                            value={servico.id}
                        >
                            {servico.nome}
                        </option>
                    ))}
                </select>
            </div>

            <button type="submit">
                Criar Pedido
            </button>
        </form>
    );
}

export default PedidoForm;