import { BadRequestException, Injectable } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import {
  DatabaseService,
  type DatabaseTransaction,
} from '../database/database.service.js';

/**
 * Esqueleto comum para operações de nota fiscal. Emissão e reenvio têm estados e
 * gravações diferentes, mas seguem a mesma sequência: carregar -> decidir -> validar -> aplicar.
 */
abstract class InvoiceWorkflow<Input, State> {
  /**
   * Template Method: as subclasses implementam cada etapa variável, enquanto este método
   * preserva a ordem. shouldApply permite encerrar cedo uma operação já concluída.
   */
  async execute(input: Input): Promise<void> {
    const state = await this.load(input);
    if (!this.shouldApply(state)) return;
    this.validate(state, input);
    await this.apply(state, input);
  }

  /** Carrega do banco o estado necessário para decidir se a operação pode prosseguir. */
  protected abstract load(input: Input): Promise<State>;

  /** Retorna false quando repetir a operação deve ser um no-op seguro. */
  protected abstract shouldApply(state: State): boolean;

  /** Rejeita identificadores ou estados inválidos antes de qualquer gravação. */
  protected abstract validate(state: State, input: Input): void;

  /** Executa a alteração de banco específica da operação. */
  protected abstract apply(state: State, input: Input): Promise<void>;
}

/** Checkout fornece a transação e o pedido para emitir a nota no mesmo commit/rollback. */
interface IssueInvoiceInput {
  client: DatabaseTransaction;
  orderId: number;
}

@Injectable()
export class IssueInvoiceWorkflow extends InvoiceWorkflow<IssueInvoiceInput, number | null> {
  protected async load({ client, orderId }: IssueInvoiceInput): Promise<number | null> {
    const [invoice] = (
      await client.query<RowDataPacket & { idNotaFiscal: number }>(
        'SELECT id_nota_fiscal AS `idNotaFiscal` FROM nota_fiscal WHERE pedido_id = $1',
        [orderId],
      )
    ).rows;
    return invoice?.idNotaFiscal ?? null;
  }

  protected shouldApply(existingInvoiceId: number | null): boolean {
    // A finalização pode ser repetida; um pedido com nota existente não deve gerar duplicata.
    return existingInvoiceId === null;
  }

  protected validate(_state: number | null, input: IssueInvoiceInput): void {
    // O checkout já carregou e bloqueou o pedido na transação que chamou este fluxo.
    if (!Number.isInteger(input.orderId) || input.orderId < 1) {
      throw new BadRequestException('Identificador de pedido inválido para emissão da nota.');
    }
  }

  protected async apply(_state: number | null, { client, orderId }: IssueInvoiceInput): Promise<void> {
    // Usa a transação do checkout: se a finalização falhar, a emissão também sofre rollback.
    const invoice = await client.query(
      `INSERT INTO nota_fiscal
        (pedido_id, serie, data_emissao, chave_acesso, mensagem_erro)
       VALUES ($1, '1', now(), '', '')`,
      [orderId],
    );
    // No esquema atual, o ID gerado pelo banco também é usado como número da nota.
    await client.query(
      `UPDATE nota_fiscal
       SET numero = $1, chave_acesso = $2
       WHERE id_nota_fiscal = $3`,
      [invoice.insertId, `1-${invoice.insertId}-${orderId}`, invoice.insertId],
    );
  }
}

/** Reinicia uma nota com falha para permitir uma nova tentativa de processamento. */
@Injectable()
export class RetryInvoiceWorkflow extends InvoiceWorkflow<number, string | null> {
  constructor(private readonly db: DatabaseService) {
    super();
  }

  protected async load(id: number): Promise<string | null> {
    const [invoice] = await this.db.query<RowDataPacket & { status: string }>(
      'SELECT status FROM nota_fiscal WHERE id_nota_fiscal = $1',
      [id],
    );
    return invoice?.status ?? null;
  }

  protected shouldApply(_status: string | null): boolean {
    // Sempre valida para que notas inexistentes e estados não reenviáveis tenham uma resposta controlada.
    return true;
  }

  protected validate(status: string | null, id: number): void {
    // Só notas com erro podem ser reenviadas; nota inexistente tem status null e também é rejeitada.
    if (!Number.isInteger(id) || id < 1 || status !== 'com_erro') {
      throw new BadRequestException('Só é possível reenviar notas fiscais com erro.');
    }
  }

  protected async apply(_status: string | null, id: number): Promise<void> {
    // Revalida o status no UPDATE para cobrir mudança concorrente ocorrida após a leitura.
    const result = await this.db.execute(
      `UPDATE nota_fiscal SET status = 'em_processamento', mensagem_erro = ''
       WHERE id_nota_fiscal = $1 AND status = 'com_erro'`,
      [id],
    );
    if (result.affectedRows === 0) {
      throw new BadRequestException('Só é possível reenviar notas fiscais com erro.');
    }
  }
}
