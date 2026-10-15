import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { isValidCpfCnpj } from './document-strategy.js';

@Injectable()
@ValidatorConstraint({ name: 'isValidCpfCnpj', async: false })
export class IsValidCpfCnpjConstraint implements ValidatorConstraintInterface {
  /**
   * Adapta a Strategy de documentos ao contrato do class-validator.
   * Retornar false faz o ValidationPipe rejeitar a requisição antes do controller.
   */
  validate(value: unknown): boolean {
    return typeof value === 'string' && isValidCpfCnpj(value);
  }

  defaultMessage(): string {
    // Mensagem exibida pelo ValidationPipe quando CPF/CNPJ é rejeitado.
    return 'Informe um CPF ou CNPJ válido.';
  }
}
