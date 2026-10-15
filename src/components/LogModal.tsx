import Modal from "./Modal";
import type { Pedido } from "../models/Pedido";
import { dataHoraBR } from "../utils/formatadores";

function LogModal({ pedido, onFechar }: { pedido: Pedido; onFechar: () => void }) {
    // O histórico já veio junto com GET /pedidos e foi convertido por reviverPedido.
    return (
        <Modal
            titulo={`Log da OS #${pedido.id}`}
            largura="larga"
            onFechar={onFechar}
        >
            {pedido.log.length === 0 ? (
                <p className="vazio">Nenhuma alteração registrada.</p>
            ) : (
                <div className="log-lista">
                    {pedido.log.map((registro, indice) => (
                        <div className="log-item" key={indice}>
                            <strong>
                                {dataHoraBR(registro.data)} - {registro.funcionario}
                            </strong>
                            <span className="log-titulo">{registro.titulo}</span>
                            <p>{registro.descricao}</p>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
}

export default LogModal;
