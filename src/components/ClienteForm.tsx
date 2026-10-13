import { useState } from "react";
import type { FormEvent } from "react";
import { Cliente } from "../models/Cliente";
import { somenteDigitos } from "../utils/formatadores";

interface ClienteFormProps {
    onClienteCadastrado: (cliente: Cliente) => Promise<string | null>;
}

function ClienteForm({ onClienteCadastrado }: ClienteFormProps) {
    const [nome, setNome] = useState("");
    const [cpfCnpj, setCpfCnpj] = useState("");
    const [telefone, setTelefone] = useState("");

    async function cadastrarCliente(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!nome.trim() || !cpfCnpj.trim() || !telefone.trim()) {
            alert("Preencha todos os campos.");
            return;
        }

        const digitosDoc = somenteDigitos(cpfCnpj).length;

        if (digitosDoc !== 11 && digitosDoc !== 14) {
            alert("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
            return;
        }

        if (somenteDigitos(telefone).length < 10) {
            alert("Informe um telefone com DDD.");
            return;
        }

        const erro = await onClienteCadastrado(
            new Cliente(Date.now(), nome.trim(), cpfCnpj.trim(), telefone.trim())
        );
        if (erro) {
            alert(erro);
            return;
        }

        setNome("");
        setCpfCnpj("");
        setTelefone("");
    }

    return (
        <form className="form-coluna" onSubmit={cadastrarCliente}>
            <div className="campo">
                <label htmlFor="nome">Nome Completo:</label>
                <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                />
            </div>

            <div className="campo">
                <label htmlFor="cpfCnpj">CPF:</label>
                <input
                    id="cpfCnpj"
                    type="text"
                    value={cpfCnpj}
                    onChange={(event) => setCpfCnpj(event.target.value)}
                />
            </div>

            <div className="campo">
                <label htmlFor="telefone">Telefone:</label>
                <input
                    id="telefone"
                    type="tel"
                    value={telefone}
                    onChange={(event) => setTelefone(event.target.value)}
                />
            </div>

            <button type="submit" className="btn btn-primario">
                Cadastrar
            </button>
        </form>
    );
}

export default ClienteForm;
