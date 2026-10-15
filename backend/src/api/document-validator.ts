import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { isValidCpfCnpj } from './document-strategy.js';

@Injectable()
@ValidatorConstraint({ name: 'isValidCpfCnpj', async: false })
export class IsValidCpfCnpjConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && isValidCpfCnpj(value);
  }

  defaultMessage(): string {
    return 'Informe um CPF ou CNPJ válido.';
  }
}
