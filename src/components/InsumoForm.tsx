import { useState } from "react";
import type { FormEvent } from "react";
import { Insumo } from "../models/Insumo";

interface InsumoFormProps {
    onInsumoCadastrado: (insumo: Insumo) => void;
}

function InsumoForm({ onInsumoCadastrado }: InsumoFormProps) {
    const [nome, setNome] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [unidade, setUnidade] = useState("");

    function cadastrarInsumo(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!nome.trim() || !quantidade || !unidade.trim()) {
            alert("Preencha todos os campos.");
            return;
        }

        const quantidadeNumerica = Number(quantidade);

        if (quantidadeNumerica < 0 || Number.isNaN(quantidadeNumerica)) {
            alert("Informe uma quantidade válida.");
            return;
        }

        const novoInsumo = new Insumo(
            Date.now(),
            nome.trim(),
            quantidadeNumerica,
            unidade.trim()
        );

        onInsumoCadastrado(novoInsumo);

        setNome("");
        setQuantidade("");
        setUnidade("");
    }

    return (
        <form className="cliente-form" onSubmit={cadastrarInsumo}>
            <div className="form-group">
                <label htmlFor="nomeInsumo">Nome do insumo</label>
                <input
                    id="nomeInsumo"
                    type="text"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    placeholder="Ex: Cimento"
                />
            </div>

            <div className="form-group">
                <label htmlFor="quantidadeInsumo">Quantidade</label>
                <input
                    id="quantidadeInsumo"
                    type="number"
                    min="0"
                    step="0.01"
                    value={quantidade}
                    onChange={(event) => setQuantidade(event.target.value)}
                    placeholder="Ex: 10"
                />
            </div>

            <div className="form-group">
                <label htmlFor="unidadeInsumo">Unidade</label>
                <input
                    id="unidadeInsumo"
                    type="text"
                    value={unidade}
                    onChange={(event) => setUnidade(event.target.value)}
                    placeholder="Ex: kg, litros ou unidades"
                />
            </div>

            <button type="submit">Cadastrar Insumo</button>
        </form>
    );
}

export default InsumoForm;
