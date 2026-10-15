import { useState } from "react";
import type { FormEvent } from "react";
import Modal from "./Modal";
import { useApp } from "../hooks/useApp";
import type { TipoMovimentacao } from "../context/AppContext";
import type { Insumo } from "../models/Insumo";

function MovimentacaoModal({ insumo, onFechar }: { insumo: Insumo; onFechar: () => void }) { // Pega do contexto global a função do AppProvider que faz a movimentação. É aqui que o template method é chamado.
    const { movimentarEstoque } = useApp();
    const [tipo, setTipo] = useState<TipoMovimentacao>("entrada");
    const [quantidade, setQuantidade] = useState("");
    const [observacao, setObservacao] = useState("");

    async function registrar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        const erro = await movimentarEstoque(insumo.id, tipo, Number(quantidade), observacao);

        if (erro) {
            alert(erro);
            return;
        }

        onFechar();
    }

    return (
        <Modal titulo="Movimentar Estoque" onFechar={onFechar}>
            <form className="form-coluna" onSubmit={registrar}>
                <p className="dica">
                    {insumo.nome} — atual: {insumo.quantidade} {insumo.unidade}
                </p>

                <div className="campo">
                    <label htmlFor="tipoMov">Tipo de Movientação</label>
                    <select
                        id="tipoMov"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as TipoMovimentacao)}
                    >
                        <option value="entrada">Entrada</option>
                        <option value="saida">Saída</option>
                        <option value="ajuste">Ajuste (definir quantidade)</option>
                    </select>
                </div>

                <div className="campo">
                    <label htmlFor="qtdMov">Quantidade</label>
                    <input
                        id="qtdMov"
                        type="number"
                        min="0"
                        step="0.01"
                        value={quantidade}
                        onChange={(e) => setQuantidade(e.target.value)}
                    />
                </div>

                <div className="campo">
                    <label htmlFor="obsMov">Observação</label>
                    <input
                        id="obsMov"
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn btn-primario">
                    Cadastrar
                </button>
            </form>
        </Modal>
    );
}

export default MovimentacaoModal;
