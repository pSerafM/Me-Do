import { config } from 'dotenv';
import { hash } from 'bcryptjs';
import { createConnection, type RowDataPacket } from 'mysql2/promise';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
config({ path: resolve(projectRoot, '.env') });

const required = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'SEED_USER_EMAIL',
  'SEED_USER_PASSWORD',
  'SEED_USER_CPF',
] as const;
const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  throw new Error(`Configure no .env as variáveis: ${missing.join(', ')}`);
}

const name = process.env.SEED_USER_NAME?.trim() || 'Administrador';
const cpf = process.env.SEED_USER_CPF!.trim();
const email = process.env.SEED_USER_EMAIL!.trim().toLowerCase();
const password = process.env.SEED_USER_PASSWORD!;
if (password.length < 12) {
  throw new Error('SEED_USER_PASSWORD precisa ter pelo menos 12 caracteres.');
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error('SEED_USER_EMAIL não é um endereço de e-mail válido.');
}

const caPath = process.env.DB_SSL_CA?.trim();
const ca = caPath
  ? readFileSync(resolve(caPath), 'utf8')
  : undefined;
const connection = await createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:
    process.env.DB_SSL === 'false'
      ? undefined
      : { rejectUnauthorized: true, ...(ca ? { ca } : {}) },
  connectTimeout: 10_000,
  timezone: 'Z',
});

try {
  await connection.beginTransaction();
  const [lockRows] = await connection.query<(RowDataPacket & { acquired: number })[]>(
    "SELECT GET_LOCK('medo_funcionario_bootstrap', 10) AS acquired",
  );
  if (lockRows[0]?.acquired !== 1) {
    throw new Error('Não foi possível bloquear a criação do usuário inicial.');
  }

  try {
    const [countRows] = await connection.query<(RowDataPacket & { total: number })[]>(
      'SELECT COUNT(*) AS total FROM funcionario',
    );
    if (Number(countRows[0]?.total) > 0) {
      throw new Error(
        'A seed só cria o usuário inicial; já existe um funcionário. Use o login ou recuperação de acesso.',
      );
    }

    await connection.execute(
      `INSERT INTO funcionario (nome, cpf, email, senha_hash, cargo)
       VALUES (?, ?, ?, ?, 'Dono')`,
      [name, cpf, email, await hash(password, 12)],
    );
    await connection.commit();
    console.log(`Usuário inicial criado: ${email}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.query("SELECT RELEASE_LOCK('medo_funcionario_bootstrap')");
  }
} finally {
  await connection.end();
}
