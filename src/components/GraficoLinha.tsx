interface GraficoLinhaProps {
    valores: number[];
    rotuloX: string;
}

const L = 400;
const A = 190;
const ESQ = 52;
const BASE = 28;

function arredondarTopo(max: number): number {
    if (max <= 0) return 100;
    const potencia = Math.pow(10, Math.floor(Math.log10(max)));
    return Math.ceil(max / potencia) * potencia;
}

function GraficoLinha({ valores, rotuloX }: GraficoLinhaProps) {
    const topo = arredondarTopo(Math.max(...valores, 0));
    const largura = L - ESQ - 8;
    const altura = A - BASE - 10;
    const passoX = valores.length > 1 ? largura / (valores.length - 1) : largura;

    const pontos = valores.map((valor, i) => ({
        x: ESQ + i * passoX,
        y: 10 + altura - (valor / topo) * altura
    }));

    const linha = pontos.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const area = `${linha} L${ESQ + (valores.length - 1) * passoX},${10 + altura} L${ESQ},${10 + altura} Z`;
    const ticks = [0, 0.25, 0.5, 0.75, 1];

    return (
        <div className="grafico">
            <h4>EVOLUÇÃO DO FATURAMENTO (R$)</h4>
            <svg viewBox={`0 0 ${L} ${A}`} role="img" aria-label="Evolução do faturamento">
                {ticks.map((t) => {
                    const y = 10 + altura - t * altura;
                    return (
                        <g key={t}>
                            <line x1={ESQ} x2={L - 8} y1={y} y2={y} stroke="#d5d9de" />
                            <text x={ESQ - 6} y={y + 3} fontSize="9" textAnchor="end" fill="#555">
                                R$ {Math.round(topo * t)}
                            </text>
                        </g>
                    );
                })}

                <path d={area} fill="#6E7F98" fillOpacity="0.45" />
                <path d={linha} fill="none" stroke="#273C5B" strokeWidth="2" />

                {[1, 8, 15, 22, valores.length]
                    .filter((dia) => dia <= valores.length)
                    .map((dia) => (
                        <text
                            key={dia}
                            x={ESQ + (dia - 1) * passoX}
                            y={A - 12}
                            fontSize="9"
                            textAnchor="middle"
                            fill="#555"
                        >
                            dia {dia}
                        </text>
                    ))}
            </svg>
            <p className="grafico-legenda">{rotuloX}</p>
        </div>
    );
}

export default GraficoLinha;
