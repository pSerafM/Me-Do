export interface DocumentStrategy {
  /** Informa se o documento tem formato e dígitos verificadores válidos. */
  validate(document: string): boolean;
}

/**
 * Aceita apenas dígitos e separadores usuais de CPF/CNPJ. Retorna null para outros
 * caracteres, evitando que letras sejam descartadas e transformem uma entrada inválida em válida.
 */
function digitsOnly(document: string): string | null {
  const normalized = document.trim();
  if (!/^[\d.\-/\s]+$/.test(normalized)) return null;
  return normalized.replace(/\D/g, '');
}

function hasRepeatedDigits(digits: string): boolean {
  // Uma sequência repetida pode ter o comprimento correto, mas não é um CPF/CNPJ válido.
  return /^(\d)\1+$/.test(digits);
}

/** Strategy de CPF: verifica comprimento, repetição e os dois dígitos verificadores. */
class CpfStrategy implements DocumentStrategy {
  validate(document: string): boolean {
    const digits = digitsOnly(document);
    if (!digits || digits.length !== 11 || hasRepeatedDigits(digits)) return false;

    const calculateDigit = (base: string): number => {
      // Os pesos do CPF decrescem de base.length + 1 até 2; resto 0 ou 1 gera dígito 0.
      const initialWeight = base.length + 1;
      const sum = base.split('').reduce(
        (total, digit, index) => total + Number(digit) * (initialWeight - index),
        0,
      );
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    return (
      calculateDigit(digits.slice(0, 9)) === Number(digits[9]) &&
      // O segundo cálculo inclui na base o primeiro dígito verificador, já conferido acima.
      calculateDigit(digits.slice(0, 10)) === Number(digits[10])
    );
  }
}

/** Strategy de CNPJ: aplica as sequências de pesos definidas para os dois dígitos verificadores. */
class CnpjStrategy implements DocumentStrategy {
  // O primeiro usa a base de 12 dígitos; o segundo inclui o primeiro verificador.
  private readonly firstDigitWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  private readonly secondDigitWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  validate(document: string): boolean {
    const digits = digitsOnly(document);
    if (!digits || digits.length !== 14 || hasRepeatedDigits(digits)) return false;

    const calculateDigit = (base: string, weights: number[]): number => {
      // Soma dígito vezes peso e aplica a regra módulo 11 do CNPJ.
      const sum = base.split('').reduce(
        (total, digit, index) => total + Number(digit) * weights[index],
        0,
      );
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    return (
      calculateDigit(digits.slice(0, 12), this.firstDigitWeights) === Number(digits[12]) &&
      // Para o segundo verificador, a base já contém o primeiro verificador.
      calculateDigit(digits.slice(0, 13), this.secondDigitWeights) === Number(digits[13])
    );
  }
}

const strategies: readonly [number, DocumentStrategy][] = [
  // O comprimento seleciona o algoritmo; as classes concretas seguem o mesmo contrato.
  [11, new CpfStrategy()],
  [14, new CnpjStrategy()],
];

export function isValidCpfCnpj(document: string): boolean {
  // A validação do servidor é autoritativa; a do cliente serve apenas para feedback imediato.
  const strategy = strategies.find(([length]) => digitsOnly(document)?.length === length);
  return strategy?.[1].validate(document) ?? false;
}
