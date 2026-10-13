import { useState } from "react";
import type { FormEvent } from "react";
import { useApp } from "../hooks/useApp";
import { dataBR, deInputData, moeda } from "../utils/formatadores";

function Despesas() {
    const { despesas, registrarDespesa, pagarDespesa } = useApp();
    const [categoria, setCategoria] = useState("");
    const [valor, setValor] = useState("");
    const [vencimento, setVencimento] = useState("");

    async function registrar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        if (!categoria.trim() || !valor || !vencimento) {
            alert("Preencha categoria, valor e data de vencimento.");
            return;
        }

        if (Number(valor) <= 0) {
            alert("Informe um valor maior que zero.");
            return;
        }

        const erro = await registrarDespesa(
            categoria.trim(),
            Number(valor),
            deInputData(vencimento)
        );
        if (erro) {
            alert(erro);
            return;
        }
        setCategoria("");
        setValor("");
        setVencimento("");
    }

    return (
        <>
            <section className="painel">
                <h2 className="painel-titulo">Novo Lançamento</h2>

                <form className="painel-corpo" onSubmit={registrar}>
                    <div className="grade-3">
                        <div className="campo">
                            <label>Categoria</label>
                            <input value={categoria} onChange={(e) => setCategoria(e.target.value)} />
                        </div>
                        <div className="campo">
                            <label>Valor</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                            />
                        </div>
                        <div className="campo">
                            <label>Data de Vencimento</label>
                            <input
                                type="date"
                                value={vencimento}
                                onChange={(e) => setVencimento(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="centro">
                        <button type="submit" className="btn btn-primario">
                            Registrar Despesa
                        </button>
                    </div>
                </form>
            </section>

            <section className="painel">
                <h2 className="painel-titulo">Despesas Lançadas</h2>

                <div className="painel-corpo sem-padding">
                    <table className="tabela">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Valor</th>
                                <th>Vencimento</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {despesas.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="vazio">
                                        Nenhuma despesa lançada.
                                    </td>
                                </tr>
                            )}
                            {despesas.map((despesa) => (
                                <tr key={despesa.idDespesa}>
                                    <td>{despesa.descricao}</td>
                                    <td>{moeda(despesa.valor)}</td>
                                    <td>{dataBR(despesa.data)}</td>
                                    <td>{despesa.status === "paga" ? "Paga" : "Pendente"}</td>
                                    <td>
                                        {despesa.status !== "paga" && (
                                            <button
                                                type="button"
                                                className="btn btn-primario btn-pequeno"
                                                onClick={async () => {
                                                    const erro = await pagarDespesa(despesa.idDespesa);
                                                    if (erro) alert(erro);
                                                }}
                                            >
                                                Marcar como paga
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}

export default Despesas;
