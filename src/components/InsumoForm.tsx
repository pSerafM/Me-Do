import { useState } from "react";
import type { FormEvent } from "react";
import { Insumo } from "../models/Insumo";

interface InsumoFormProps {
    // devolve a mensagem de erro, ou null se cadastrou
    onInsumoCadastrado: (insumo: Insumo) => string | null;
}

function InsumoForm({ onInsumoCadastrado }: InsumoFormProps) {
    const [nome, setNome] = useState("");
    const [sku, setSku] = useState("");
    const [categoria, setCategoria] = useState("");
    const [precoCusto, setPrecoCusto] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [unidade, setUnidade] = useState("un");
    const [minimo, setMinimo] = useState("");

    function cadastrarInsumo(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!nome.trim() || quantidade === "" || !unidade.trim()) {
            alert("Preencha nome, quantidade e unidade.");
            return;
        }

        const quantidadeNumerica = Number(quantidade);

        if (quantidadeNumerica < 0 || Number.isNaN(quantidadeNumerica)) {
            alert("Informe uma quantidade válida.");
            return;
        }

        const erro = onInsumoCadastrado(
            new Insumo(
                Date.now(),
                nome.trim(),
                quantidadeNumerica,
                unidade.trim(),
                sku.trim(),
                categoria.trim(),
                Number(precoCusto) || 0,
                Number(minimo) || 0
            )
        );

        if (erro) {
            alert(erro);
            return;
        }

        setNome("");
        setSku("");
        setCategoria("");
        setPrecoCusto("");
        setQuantidade("");
        setUnidade("un");
        setMinimo("");
    }

    return (
        <form className="form-coluna" onSubmit={cadastrarInsumo}>
            <div className="campo">
                <label htmlFor="nomeInsumo">Nome</label>
                <input id="nomeInsumo" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>

            <div className="campo">
                <label htmlFor="skuInsumo">SKU</label>
                <input id="skuInsumo" value={sku} onChange={(e) => setSku(e.target.value)} />
            </div>

            <div className="campo">
                <label htmlFor="categoriaInsumo">Categoria</label>
                <input
                    id="categoriaInsumo"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                />
            </div>

            <div className="campo">
                <label htmlFor="custoInsumo">Preço de Custo (R$)</label>
                <input
                    id="custoInsumo"
                    type="number"
                    min="0"
                    step="0.01"
                    value={precoCusto}
                    onChange={(e) => setPrecoCusto(e.target.value)}
                />
            </div>

            <div className="campo">
                <label htmlFor="qtdInsumo">Quantidade</label>
                <input
                    id="qtdInsumo"
                    type="number"
                    min="0"
                    step="0.01"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                />
            </div>

            <div className="campo">
                <label htmlFor="unidadeInsumo">Unidade</label>
                <input
                    id="unidadeInsumo"
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                />
            </div>

            <div className="campo">
                <label htmlFor="minInsumo">Nível mínimo (alerta)</label>
                <input
                    id="minInsumo"
                    type="number"
                    min="0"
                    value={minimo}
                    onChange={(e) => setMinimo(e.target.value)}
                />
            </div>

            <button type="submit" className="btn btn-primario">
                Cadastrar
            </button>
        </form>
    );
}

export default InsumoForm;
