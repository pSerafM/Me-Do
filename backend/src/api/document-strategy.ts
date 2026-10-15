export interface DocumentStrategy {
  validate(document: string): boolean;
}

function digitsOnly(document: string): string | null {
  const normalized = document.trim();
  if (!/^[\d.\-/\s]+$/.test(normalized)) return null;
  return normalized.replace(/\D/g, '');
}

function hasRepeatedDigits(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

class CpfStrategy implements DocumentStrategy {
  validate(document: string): boolean {
    const digits = digitsOnly(document);
    if (!digits || digits.length !== 11 || hasRepeatedDigits(digits)) return false;

    const calculateDigit = (base: string): number => {
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
      calculateDigit(digits.slice(0, 10)) === Number(digits[10])
    );
  }
}

class CnpjStrategy implements DocumentStrategy {
  private readonly firstDigitWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  private readonly secondDigitWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  validate(document: string): boolean {
    const digits = digitsOnly(document);
    if (!digits || digits.length !== 14 || hasRepeatedDigits(digits)) return false;

    const calculateDigit = (base: string, weights: number[]): number => {
      const sum = base.split('').reduce(
        (total, digit, index) => total + Number(digit) * weights[index],
        0,
      );
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    return (
      calculateDigit(digits.slice(0, 12), this.firstDigitWeights) === Number(digits[12]) &&
      calculateDigit(digits.slice(0, 13), this.secondDigitWeights) === Number(digits[13])
    );
  }
}

const strategies: readonly [number, DocumentStrategy][] = [
  [11, new CpfStrategy()],
  [14, new CnpjStrategy()],
];

export function isValidCpfCnpj(document: string): boolean {
  const strategy = strategies.find(([length]) => digitsOnly(document)?.length === length);
  return strategy?.[1].validate(document) ?? false;
}
