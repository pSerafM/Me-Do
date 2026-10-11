import { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
    titulo?: string;
    icone?: ReactNode;
    largura?: "estreita" | "larga";
    onFechar: () => void;
    children: ReactNode;
}

function Modal({ titulo, icone, largura = "estreita", onFechar, children }: ModalProps) {
    useEffect(() => {
        function aoTeclar(evento: KeyboardEvent) {
            if (evento.key === "Escape") {
                onFechar();
            }
        }

        window.addEventListener("keydown", aoTeclar);
        return () => window.removeEventListener("keydown", aoTeclar);
    }, [onFechar]);

    return (
        <div className="modal-fundo" onClick={onFechar}>
            <div
                className={`modal modal-${largura}`}
                role="dialog"
                aria-modal="true"
                onClick={(evento) => evento.stopPropagation()}
            >
                <button className="modal-fechar" onClick={onFechar} aria-label="Fechar">
                    ✕
                </button>

                {icone && <div className="modal-icone">{icone}</div>}
                {titulo && <h2 className="modal-titulo">{titulo}</h2>}

                {children}
            </div>
        </div>
    );
}

export default Modal;
