import { useState } from "react";
import type { FormEvent } from "react";
import { Cliente } from "../models/Cliente";

interface ClienteFormProps {
    onClienteCadastrado: (cliente: Cliente) => void;
}

function ClienteForm({ onClienteCadastrado }: ClienteFormProps) {
    const [nome, setNome] = useState("");
    const [cpfCnpj, setCpfCnpj] = useState("");
    const [telefone, setTelefone] = useState("");

    function cadastrarCliente(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!nome || !cpfCnpj || !telefone) {
            alert("Preencha todos os campos.");
            return;
        }

        const novoCliente = new Cliente(
            Date.now(),
            nome,
            cpfCnpj,
            telefone
        );

        onClienteCadastrado(novoCliente);

        setNome("");
        setCpfCnpj("");
        setTelefone("");
    }

    return (
        <form className="cliente-form" onSubmit={cadastrarCliente}>
            <div className="form-group">
                <label htmlFor="nome">Nome</label>
                <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    placeholder="Digite o nome do cliente"
                />
            </div>

            <div className="form-group">
                <label htmlFor="cpfCnpj">CPF/CNPJ</label>
                <input
                    id="cpfCnpj"
                    type="text"
                    value={cpfCnpj}
                    onChange={(event) => setCpfCnpj(event.target.value)}
                    placeholder="Digite o CPF ou CNPJ"
                />
            </div>

            <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <input
                    id="telefone"
                    type="tel"
                    value={telefone}
                    onChange={(event) => setTelefone(event.target.value)}
                    placeholder="Digite o telefone"
                />
            </div>

            <button type="submit">
                Cadastrar Cliente
            </button>
        </form>
    );
}

export default ClienteForm;