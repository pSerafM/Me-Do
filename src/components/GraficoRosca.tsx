import type { FatiaServico } from "../services/CalculoFinanceiro";

const CORES = ["#273C5B", "#D9626B", "#E8B13F", "#4FA39B"];
const RAIO = 40;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

function GraficoRosca({ fatias }: { fatias: FatiaServico[] }) {
    // deslocamento de cada fatia = soma dos tamanhos das anteriores
    const tamanhos = fatias.map((f) => (f.percentual / 100) * CIRCUNFERENCIA);
    const inicios = tamanhos.map((_, i) =>
        tamanhos.slice(0, i).reduce((soma, t) => soma + t, 0)
    );

    return (
        <div className="grafico">
            <h4>SERVIÇOS MAIS CONTRATADOS</h4>

            {fatias.length === 0 ? (
                <p className="vazio">Sem dados no período.</p>
            ) : (
                <div className="rosca">
                    <svg viewBox="0 0 120 120" role="img" aria-label="Serviços mais contratados">
                        {fatias.map((fatia, i) => {
                            const tamanho = tamanhos[i];
                            const deslocamento = -inicios[i];

                            return (
                                <circle
                                    key={fatia.nome}
                                    cx="60"
                                    cy="60"
                                    r={RAIO}
                                    fill="none"
                                    stroke={CORES[i % CORES.length]}
                                    strokeWidth="22"
                                    strokeDasharray={`${tamanho} ${CIRCUNFERENCIA - tamanho}`}
                                    strokeDashoffset={deslocamento}
                                    transform="rotate(-90 60 60)"
                                />
                            );
                        })}
                    </svg>

                    <ul className="rosca-legenda">
                        {fatias.map((fatia, i) => (
                            <li key={fatia.nome}>
                                <span style={{ background: CORES[i % CORES.length] }} />
                                {fatia.nome} ({Math.round(fatia.percentual)}%)
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default GraficoRosca;
