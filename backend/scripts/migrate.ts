import 'dotenv/config';
import { config } from 'dotenv';
import { readdir, readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createConnection, type RowDataPacket } from 'mysql2/promise';

config({ path: '../.env' });

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'] as const;
for (const key of required) {
  if (!process.env[key]) throw new Error(`Variável obrigatória ausente: ${key}`);
}

const connection = await createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:
    process.env.DB_SSL === 'false'
      ? undefined
      : {
          rejectUnauthorized: true,
          ...(process.env.DB_SSL_CA
            ? { ca: readFileSync(process.env.DB_SSL_CA, 'utf8') }
            : {}),
        },
  timezone: 'Z',
});

try {
  await connection.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       name VARCHAR(190) NOT NULL PRIMARY KEY,
       applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  );
  const migrationsPath = resolve('src/database/migrations');
  const migrationFiles = (await readdir(migrationsPath))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const name = file.slice(0, -'.sql'.length);
    const [applied] = await connection.query<RowDataPacket[]>(
      'SELECT name FROM schema_migrations WHERE name = ?',
      [name],
    );
    if (applied.length) {
      console.log(`Migração ${name} já aplicada.`);
      continue;
    }

    const sql = await readFile(resolve(migrationsPath, file), 'utf8');
    for (const statement of sql.split(';').map((part) => part.trim()).filter(Boolean)) {
      const addedColumn = statement.match(
        /ALTER\s+TABLE\s+`?([a-zA-Z0-9_]+)`?\s+ADD\s+COLUMN\s+`?([a-zA-Z0-9_]+)`?/i,
      );
      if (addedColumn) {
        const [, table, column] = addedColumn;
        const [existingColumn] = await connection.query<RowDataPacket[]>(
          `SELECT COLUMN_NAME
           FROM information_schema.COLUMNS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
          [table, column],
        );
        if (existingColumn.length) continue;
      }

      const constraint = statement.match(/ADD\s+CONSTRAINT\s+([a-zA-Z0-9_]+)/i)?.[1];
      if (constraint) {
        const [existing] = await connection.query<RowDataPacket[]>(
          `SELECT CONSTRAINT_NAME
           FROM information_schema.REFERENTIAL_CONSTRAINTS
           WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = ?`,
          [constraint],
        );
        if (existing.length) continue;
      }
      await connection.query(statement);
    }
    if (name === '002_employee_cargo') {
      const [columns] = await connection.query<
        (RowDataPacket & { columnType: string; isNullable: string; defaultValue: string })[]
      >(
        `SELECT COLUMN_TYPE AS columnType, IS_NULLABLE AS isNullable,
                COLUMN_DEFAULT AS defaultValue
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'funcionario' AND COLUMN_NAME = 'cargo'`,
      );
      const column = columns[0];
      if (
        !column ||
        column.columnType.toLowerCase() !==
          "enum('atendente','prestador','gestor','dono')" ||
        column.isNullable !== 'NO' ||
        column.defaultValue !== 'Atendente'
      ) {
        throw new Error(
          'A coluna funcionario.cargo deve ser ENUM(Atendente, Prestador, Gestor, Dono), NOT NULL e ter DEFAULT Atendente.',
        );
      }
    }
    await connection.query('INSERT INTO schema_migrations (name) VALUES (?)', [name]);
    console.log(`Migração ${name} aplicada.`);
  }
} finally {
  await connection.end();
}
