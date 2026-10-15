export interface EstrategiaDocumento {
    validar(documento: string): boolean;
}

function somenteDigitos(documento: string): string | null {
    const normalizado = documento.trim();
    if (!/^[\d.\-/\s]+$/.test(normalizado)) return null;
    return normalizado.replace(/\D/g, "");
}

function todosDigitosIguais(digitos: string): boolean {
    return /^(\d)\1+$/.test(digitos);
}

class EstrategiaCpf implements EstrategiaDocumento {
    validar(documento: string): boolean {
        const digitos = somenteDigitos(documento);
        if (!digitos || digitos.length !== 11 || todosDigitosIguais(digitos)) return false;

        const calcularDigito = (base: string): number => {
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
            calcularDigito(digitos.slice(0, 9)) === Number(digitos[9]) &&
            calcularDigito(digitos.slice(0, 10)) === Number(digitos[10])
        );
    }
}

class EstrategiaCnpj implements EstrategiaDocumento {
    private readonly pesosPrimeiroDigito = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    private readonly pesosSegundoDigito = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    validar(documento: string): boolean {
        const digitos = somenteDigitos(documento);
        if (!digitos || digitos.length !== 14 || todosDigitosIguais(digitos)) return false;

        const calcularDigito = (base: string, pesos: number[]): number => {
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
            calcularDigito(digitos.slice(0, 13), this.pesosSegundoDigito) ===
                Number(digitos[13])
        );
    }
}

const estrategias: readonly [number, EstrategiaDocumento][] = [
    [11, new EstrategiaCpf()],
    [14, new EstrategiaCnpj()]
];

export function validarCpfCnpj(documento: string): boolean {
    const estrategia = estrategias.find(([tamanho]) => somenteDigitos(documento)?.length === tamanho);
    return estrategia?.[1].validar(documento) ?? false;
}
