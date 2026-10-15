import { useState } from "react";
import type { FormEvent } from "react";
import Modal from "./Modal";
import type { FormaPagamento } from "../context/AppContext";
import { moeda } from "../utils/formatadores";
import { ESTRATEGIAS } from "../services/EstrategiaPagamento";

interface PagamentoModalProps {
    titulo: string;
    valorInicial: number;
    valorTravado?: boolean;
    onConfirmar: (valor: number, forma: FormaPagamento) => void;
    onFechar: () => void;
}

function PagamentoModal({
    titulo,
    valorInicial,
    valorTravado,
    onConfirmar,
    onFechar
}: PagamentoModalProps) {
    const [valor, setValor] = useState(valorInicial.toFixed(2));
    const [forma, setForma] = useState<FormaPagamento>("pix");

    function confirmar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        const numero = Number(valor);

        if (Number.isNaN(numero) || numero <= 0) {
            alert("Informe um valor maior que zero.");
            return;
        }

        // Strategy: aplica a regra da forma escolhida antes de confirmar.
        try {
            ESTRATEGIAS[forma].validar(numero);
        } catch (erro) {
            alert((erro as Error).message);
            return;
        }

        onConfirmar(numero, forma);
    }

    return (
        <Modal titulo={titulo} icone="$" onFechar={onFechar}>
            <form className="form-coluna" onSubmit={confirmar}>
                <p className="dica">Valor do pedido a receber: {moeda(valorInicial)}</p>

                <div className="campo">
                    <label htmlFor="valorPagamento">Valor (R$)</label>
                    <input
                        id="valorPagamento"
                        type="number"
                        min="0"
                        step="0.01"
                        value={valor}
                        disabled={valorTravado}
                        onChange={(e) => setValor(e.target.value)}
                    />
                </div>

                <div className="campo">
                    <label htmlFor="formaPagamento">Forma de pagamento</label>
                    <select
                        id="formaPagamento"
                        value={forma}
                        onChange={(e) => setForma(e.target.value as FormaPagamento)}
                    >
                        {Object.entries(ESTRATEGIAS).map(([chave, estrategia]) => (
                            <option key={chave} value={chave}>
                                {estrategia.rotulo}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-primario">
                    Confirmar Pagamento
                </button>
            </form>
        </Modal>
    );
}

export default PagamentoModal;
