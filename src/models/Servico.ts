import { CobrancaPrecoFixo } from "../services/CobrancaPrecoFixo";
import type { EstrategiaCobranca } from "../services/EstrategiaCobranca";

export class Servico {
    id: number;
    nome: string;
    valor: number;
    horasEstimadas: number;
    descricao: string;
    status: boolean;

    // O serviço guarda a regra atual pela interface, sem depender de uma regra concreta.
    private estrategiaCobranca: EstrategiaCobranca;

    constructor(
        id: number,
        nome: string,
        valor: number,
        horasEstimadas: number,
        descricao: string = "",

        // Opcional para manter o preço fixo como padrão e preservar as chamadas existentes.
        estrategiaCobranca: EstrategiaCobranca = new CobrancaPrecoFixo()

    ) {
        this.id = id;
        this.nome = nome;
        this.valor = valor;
        this.horasEstimadas = horasEstimadas;
        this.descricao = descricao;
        this.status = true;
        this.estrategiaCobranca = estrategiaCobranca;
    }

    ativar(): void {
        this.status = true;
    }

    desativar(): void {
        this.status = false;
    }


    // Permite trocar a regra de cobrança sem criar outro serviço.
    definirEstrategiaCobranca(estrategia: EstrategiaCobranca): void {
        this.estrategiaCobranca = estrategia;
    }

    nomeCobranca(): string {
        return this.estrategiaCobranca.nome;
    }

    // A estratégia escolhida decide o cálculo usando valor e horas deste serviço.
    calcularValor(): number {
        return this.estrategiaCobranca.calcular(this);
    }
}