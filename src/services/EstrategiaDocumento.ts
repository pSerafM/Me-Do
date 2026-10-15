export interface EstrategiaDocumento {
    /** Retorna true somente quando o formato e os dígitos verificadores são válidos. */
    validar(documento: string): boolean;
}

/**
 * Aceita dígitos e separadores usuais, rejeitando outros caracteres antes da
 * normalização para que letras não sejam descartadas silenciosamente.
 */
function somenteDigitos(documento: string): string | null {
    const normalizado = documento.trim();
    if (!/^[\d.\-/\s]+$/.test(normalizado)) return null;
    return normalizado.replace(/\D/g, "");
}

function todosDigitosIguais(digitos: string): boolean {
    // Sequências repetidas são inválidas mesmo quando têm o comprimento correto.
    return /^(\d)\1+$/.test(digitos);
}

/** Strategy de CPF: valida os 11 dígitos e calcula os dois verificadores. */
class EstrategiaCpf implements EstrategiaDocumento {
    /** Confere comprimento e calcula os dígitos de controle antes de aceitar o CPF. */
    validar(documento: string): boolean {
        const digitos = somenteDigitos(documento);
        if (!digitos || digitos.length !== 11 || todosDigitosIguais(digitos)) return false;

        const calcularDigito = (base: string): number => {
            // Pesos decrescentes multiplicam cada dígito; resto 0 ou 1 gera dígito verificador 0.
            const pesoInicial = base.length + 1;
            const soma = base.split("").reduce(
                (total, digito, indice) =>
                    total + Number(digito) * (pesoInicial - indice),
                0
            );
            const resto = soma % 11;
            return resto < 2 ? 0 : 11 - resto;
        };

        return (
            // O segundo cálculo usa os nove dígitos e o primeiro verificador já validado.
            calcularDigito(digitos.slice(0, 9)) === Number(digitos[9]) &&
            calcularDigito(digitos.slice(0, 10)) === Number(digitos[10])
        );
    }
}

/** Strategy de CNPJ: aplica as sequências de pesos do documento para calcular os verificadores. */
class EstrategiaCnpj implements EstrategiaDocumento {
    // Cada lista de pesos corresponde à base usada para calcular um dos verificadores do CNPJ.
    private readonly pesosPrimeiroDigito = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    private readonly pesosSegundoDigito = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    /** Confere comprimento, rejeita sequências repetidas e valida os dois verificadores do CNPJ. */
    validar(documento: string): boolean {
        const digitos = somenteDigitos(documento);
        if (!digitos || digitos.length !== 14 || todosDigitosIguais(digitos)) return false;

        const calcularDigito = (base: string, pesos: number[]): number => {
            // Soma cada dígito multiplicado pelo peso correspondente; aplica a regra módulo 11.
            const soma = [...base].reduce(
                (total, digito, indice) => total + Number(digito) * pesos[indice],
                0
            );
            const resto = soma % 11;
            return resto < 2 ? 0 : 11 - resto;
        };

        return (
            calcularDigito(digitos.slice(0, 12), this.pesosPrimeiroDigito) ===
                Number(digitos[12]) &&
            // A segunda base inclui o primeiro verificador no cálculo do último.
            calcularDigito(digitos.slice(0, 13), this.pesosSegundoDigito) ===
                Number(digitos[13])
        );
    }
}

const estrategias: readonly [number, EstrategiaDocumento][] = [
    // O comprimento seleciona o algoritmo; ambas as estratégias seguem o mesmo contrato.
    [11, new EstrategiaCpf()],
    [14, new EstrategiaCnpj()]
];

export function validarCpfCnpj(documento: string): boolean {
    // O cliente dá retorno imediato; a API repete a regra antes de persistir o cadastro.
    const estrategia = estrategias.find(([tamanho]) => somenteDigitos(documento)?.length === tamanho);
    return estrategia?.[1].validar(documento) ?? false;
}
