import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPool,
  type Pool,
  type PoolConnection,
  type OkPacket,
  type QueryResult,
  type ResultSetHeader,
  type RowDataPacket,
} from 'mysql2/promise';
import { readFileSync } from 'node:fs';

export interface DatabaseResult<T extends RowDataPacket = RowDataPacket> {
  rows: T[];
  insertId: number;
  affectedRows: number;
}

export type SqlValue = string | number | bigint | boolean | Date | null;

export interface DatabaseTransaction {
  query<T extends RowDataPacket = RowDataPacket>(
    text: string,
    values?: readonly SqlValue[],
  ): Promise<DatabaseResult<T>>;
}

class TransactionConnection implements DatabaseTransaction {
  constructor(private readonly connection: PoolConnection) {}

  async query<T extends RowDataPacket = RowDataPacket>(
    text: string,
    values: readonly SqlValue[] = [],
  ): Promise<DatabaseResult<T>> {
    const [sql, parameters] = convertPlaceholders(text, values);
    const [result] = await this.connection.execute(sql, parameters);
    return normalizeResult<T>(result);
  }
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(config: ConfigService) {
    const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'] as const;
    const values = Object.fromEntries(required.map((key) => [key, config.get<string>(key)]));
    const missing = required.filter((key) => !values[key]);
    if (missing.length) {
      throw new Error(`Variáveis obrigatórias ausentes: ${missing.join(', ')}`);
    }

    const port = Number(values.DB_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('DB_PORT deve ser uma porta TCP válida.');
    }

    this.pool = createPool({
      host: values.DB_HOST,
      port,
      user: values.DB_USER,
      password: values.DB_PASSWORD,
      database: values.DB_NAME,
      ssl:
        config.get<string>('DB_SSL') === 'false'
          ? undefined
          : {
              rejectUnauthorized: true,
              ...(config.get<string>('DB_SSL_CA')
                ? { ca: readFileSync(config.get<string>('DB_SSL_CA')!, 'utf8') }
                : {}),
            },
      connectTimeout: 10_000,
      connectionLimit: 10,
      supportBigNumbers: true,
      bigNumberStrings: false,
      dateStrings: false,
      timezone: 'Z',
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.pool.query('SELECT 1');
    } catch (error) {
      throw new ServiceUnavailableException(
        `Não foi possível conectar ao MySQL: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async query<T extends RowDataPacket = RowDataPacket>(
    text: string,
    values: readonly SqlValue[] = [],
  ): Promise<T[]> {
    const [sql, parameters] = convertPlaceholders(text, values);
    const [result] = await this.pool.execute(sql, parameters);
    return normalizeResult<T>(result).rows;
  }

  async execute(
    text: string,
    values: readonly SqlValue[] = [],
  ): Promise<DatabaseResult> {
    const [sql, parameters] = convertPlaceholders(text, values);
    const [result] = await this.pool.execute(sql, parameters);
    return normalizeResult(result);
  }

  async transaction<T>(work: (client: DatabaseTransaction) => Promise<T>): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await work(new TransactionConnection(connection));
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

function convertPlaceholders(
  text: string,
  values: readonly SqlValue[],
): [string, SqlValue[]] {
  const ordered: SqlValue[] = [];
  const sql = text.replace(/\$(\d+)/g, (_match, index: string) => {
    const value = values[Number(index) - 1];
    if (value === undefined) {
      throw new Error(`SQL placeholder $${index} has no matching parameter.`);
    }
    ordered.push(value);
    return '?';
  });
  return [sql, ordered];
}

function normalizeResult<T extends RowDataPacket>(
  result: QueryResult,
): DatabaseResult<T> {
  if (Array.isArray(result)) {
    return { rows: result as T[], insertId: 0, affectedRows: result.length };
  }
  const header = result as ResultSetHeader | OkPacket;
  return { rows: [], insertId: header.insertId, affectedRows: header.affectedRows };
}
