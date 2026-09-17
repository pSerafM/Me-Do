import { useState } from "react";
import ClienteForm from "./components/ClienteForm";
import { Cliente } from "./models/Cliente";
import "./App.css";

function App() {
    const [clientes, setClientes] = useState<Cliente[]>([]);

    function cadastrarCliente(cliente: Cliente) {
        setClientes((clientesAtuais) => [
            ...clientesAtuais,
            cliente
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

                                    <p>
                                        <strong>ID:</strong>{" "}
                                        {cliente.id}
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