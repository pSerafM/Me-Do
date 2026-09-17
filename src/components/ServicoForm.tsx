import { useState } from "react";
import type { FormEvent } from "react";
import { Servico } from "../models/Servico";

interface ServicoFormProps {
    onServicoCadastrado: (servico: Servico) => void;
}

function ServicoForm({ onServicoCadastrado }: ServicoFormProps) {
    const [nome, setNome] = useState("");
    const [valor, setValor] = useState("");
    const [horasEstimadas, setHorasEstimadas] = useState("");

    function cadastrarServico(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!nome || !valor || !horasEstimadas) {
            alert("Preencha todos os campos.");
            return;
        }

        const novoServico = new Servico(
            Date.now(),
            nome,
            Number(valor),
            Number(horasEstimadas)
        );

        onServicoCadastrado(novoServico);

        setNome("");
        setValor("");
        setHorasEstimadas("");
    }

    return (
        <form className="cliente-form" onSubmit={cadastrarServico}>
            <div className="form-group">
                <label htmlFor="nomeServico">Nome do serviço</label>
                <input
                    id="nomeServico"
                    type="text"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    placeholder="Ex: Troca de óleo"
                />
            </div>

            <div className="form-group">
                <label htmlFor="valorServico">Valor (R$)</label>
                <input
                    id="valorServico"
                    type="number"
                    min="0"
                    step="0.01"
                    value={valor}
                    onChange={(event) => setValor(event.target.value)}
                    placeholder="Ex: 150.00"
                />
            </div>

            <div className="form-group">
                <label htmlFor="horasServico">
                    Horas estimadas
                </label>
                <input
                    id="horasServico"
                    type="number"
                    min="0"
                    step="0.5"
                    value={horasEstimadas}
                    onChange={(event) =>
                        setHorasEstimadas(event.target.value)
                    }
                    placeholder="Ex: 2"
                />
            </div>

            <button type="submit">
                Cadastrar Serviço
            </button>
        </form>
    );
}

export default ServicoForm;