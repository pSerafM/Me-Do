import 'dotenv/config';
import { config } from 'dotenv';
import { readFile } from 'node:fs/promises';
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
  const [applied] = await connection.query<RowDataPacket[]>(
    'SELECT name FROM schema_migrations WHERE name = ?',
    ['001_initial'],
  );
  if (applied.length) {
    console.log('Migração 001 já aplicada.');
  } else {
    const sql = await readFile(resolve('src/database/migrations/001_initial.sql'), 'utf8');
    for (const statement of sql.split(';').map((part) => part.trim()).filter(Boolean)) {
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
    await connection.query('INSERT INTO schema_migrations (name) VALUES (?)', ['001_initial']);
    console.log('Migração 001 aplicada.');
  }
} finally {
  await connection.end();
}
