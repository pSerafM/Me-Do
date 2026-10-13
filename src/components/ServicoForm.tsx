import { useState } from "react";
import type { FormEvent } from "react";
import type { Servico } from "../models/Servico";
import type { DadosServico } from "../context/AppContext";

interface ServicoFormProps {
    inicial?: Servico;
    rotuloBotao: string;
    limparAoSalvar?: boolean;
    // devolve a mensagem de erro, ou null se salvou
    onSalvar: (dados: DadosServico) => string | null | Promise<string | null>;
}

function ServicoForm({ inicial, rotuloBotao, limparAoSalvar, onSalvar }: ServicoFormProps) {
    const [nome, setNome] = useState(inicial?.nome ?? "");
    const [valor, setValor] = useState(inicial ? String(inicial.valor) : "");
    const [horas, setHoras] = useState(inicial ? String(inicial.horasEstimadas) : "");
    const [descricao, setDescricao] = useState(inicial?.descricao ?? "");

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!nome.trim() || !valor || !horas) {
            alert("Preencha nome, valor e tempo estimado.");
            return;
        }

        if (Number(valor) < 0 || Number(horas) <= 0) {
            alert("Informe valores válidos.");
            return;
        }

        const erro = await onSalvar({
            nome: nome.trim(),
            valor: Number(valor),
            horasEstimadas: Number(horas),
            descricao: descricao.trim()
        });

        if (erro) {
            alert(erro);
            return;
        }

        if (limparAoSalvar) {
            setNome("");
            setValor("");
            setHoras("");
            setDescricao("");
        }
    }

    return (
        <form className="form-servico" onSubmit={salvar}>
            <div className="campo campo-nome">
                <label htmlFor="nomeServico">Nome de Serviço</label>
                <input
                    id="nomeServico"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />
            </div>

            <div className="campo">
                <label htmlFor="valorServico">Valor Padrão</label>
                <input
                    id="valorServico"
                    type="number"
                    min="0"
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                />
            </div>

            <div className="campo">
                <label htmlFor="horasServico">Tempo Estimado (h)</label>
                <input
                    id="horasServico"
                    type="number"
                    min="0"
                    step="0.5"
                    value={horas}
                    onChange={(e) => setHoras(e.target.value)}
                />
            </div>

            <div className="campo campo-largo">
                <label htmlFor="descServico">Descrição</label>
                <input
                    id="descServico"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                />
            </div>

            <button type="submit" className="btn btn-primario campo-largo">
                {rotuloBotao}
            </button>
        </form>
    );
}

export default ServicoForm;
