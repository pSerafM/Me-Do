import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../database/database.service.js';
import type { DespesaDto } from './api.dto.js';

export interface ExpenseRow extends RowDataPacket {
  /** Alias usado pela API para manter o nome de campo esperado pelo modelo do frontend. */
  idDespesa: number;
  descricao: string;
  valor: number;
  data: Date | string;
  status: string;
}

/**
 * Fluxo comum de processamento de despesas.
 * As subclasses definem a validação e a gravação específicas de cada operação;
 * esta classe mantém a sequência validar -> persistir -> reler o registro.
 */
abstract class ExpenseWorkflow<Input> {
  constructor(protected readonly db: DatabaseService) {}

  /**
   * Template Method: valida a entrada, executa a gravação específica e relê do banco
   * a linha canônica que será devolvida ao cliente. As subclasses não reordenam os passos.
   */
  async execute(input: Input): Promise<ExpenseRow> {
    this.validate(input);
    const id = await this.persist(input);
    const [expense] = await this.db.query<ExpenseRow>(
      `SELECT id_despesa AS \`idDespesa\`, descricao, valor, data, status
       FROM despesa_interna WHERE id_despesa = $1`,
      [id],
    );
    if (!expense) {
      throw new InternalServerErrorException('Não foi possível recuperar a despesa.');
    }
    return expense;
  }

  /** Etapa variável: valida dados próprios da operação antes de qualquer gravação. */
  protected abstract validate(input: Input): void;

  /** Etapa variável: grava a operação e devolve o ID necessário para reler a despesa. */
  protected abstract persist(input: Input): Promise<number>;
}

/** Fluxo concreto para cadastrar uma despesa interna ainda não paga. */
@Injectable()
export class RegisterExpenseWorkflow extends ExpenseWorkflow<DespesaDto> {
  constructor(db: DatabaseService) {
    super(db);
  }

  protected validate(input: DespesaDto): void {
    // Os decorators validam o formato HTTP; estas verificações também protegem chamadas diretas ao fluxo.
    if (!input.descricao.trim() || !Number.isFinite(input.valor) || input.valor <= 0) {
      throw new BadRequestException('Informe a descrição e um valor válido para a despesa.');
    }
  }

  protected async persist(input: DespesaDto): Promise<number> {
    // Parâmetros vinculados mantêm os valores informados separados do comando SQL.
    const result = await this.db.execute(
      `INSERT INTO despesa_interna (descricao, valor, data)
       VALUES ($1, $2, $3)`,
      [input.descricao.trim(), input.valor, input.data],
    );
    return result.insertId;
  }
}

/** Fluxo concreto para marcar como paga uma despesa já cadastrada. */
@Injectable()
export class PayExpenseWorkflow extends ExpenseWorkflow<number> {
  constructor(db: DatabaseService) {
    super(db);
  }

  protected validate(id: number): void {
    // O ParseIntPipe valida a rota; o fluxo também protege sua própria fronteira de entrada.
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException('Identificador de despesa inválido.');
    }
  }

  protected async persist(id: number): Promise<number> {
    const result = await this.db.execute(
      `UPDATE despesa_interna SET status = 'paga' WHERE id_despesa = $1`,
      [id],
    );
    if (result.affectedRows === 0) {
      throw new NotFoundException('Despesa não encontrada.');
    }
    // O ID permite que o Template Method releia a despesa atualizada para a resposta.
    return id;
  }
}
