import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { timingSafeEqual } from 'node:crypto';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../database/database.service.js';
import type { AuthenticatedUser } from './auth.types.js';
import type { BootstrapDto } from './auth.dto.js';
import type { Cargo } from './roles.js';

interface EmployeeRow extends RowDataPacket {
  idFuncionario: string;
  nome: string;
  email: string;
  senhaHash: string;
  status: string;
  cargo: Cargo;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<AuthenticatedUser> {
    const [employee] = await this.db.query<EmployeeRow>(
      `SELECT id_funcionario AS \`idFuncionario\`, nome, email,
              senha_hash AS \`senhaHash\`, status, cargo
       FROM funcionario WHERE LOWER(email) = LOWER($1)`,
      [email.trim()],
    );

    if (!employee || employee.status !== 'ativo' || !(await compare(password, employee.senhaHash))) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    return this.toUser(employee);
  }

  async bootstrap(data: BootstrapDto): Promise<AuthenticatedUser> {
    const expected = this.config.get<string>('BOOTSTRAP_TOKEN');
    if (!expected) {
      throw new InternalServerErrorException('BOOTSTRAP_TOKEN não está configurado no backend.');
    }

    const providedBuffer = Buffer.from(data.token);
    const expectedBuffer = Buffer.from(expected);
    if (
      providedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Token de bootstrap inválido.');
    }

    const senhaHash = await hash(data.senha, 12);
    return this.db.transaction(async (client) => {
      const [{ acquired }] = (
        await client.query<RowDataPacket & { acquired: number }>(
          "SELECT GET_LOCK('medo_funcionario_bootstrap', 10) AS acquired",
        )
      ).rows;
      if (acquired !== 1) {
        throw new InternalServerErrorException('Não foi possível bloquear o bootstrap.');
      }
      try {
        const [{ total }] = (
          await client.query<RowDataPacket & { total: number }>('SELECT COUNT(*) AS total FROM funcionario')
        ).rows;
        if (Number(total) > 0) {
          throw new ConflictException('O bootstrap já foi concluído: já existe um funcionário.');
        }
        const result = await client.query(
        `INSERT INTO funcionario
           (nome, cpf, email, senha_hash, cargo, telefone, genero, data_de_nascimento,
            cep, rua, cidade, estado, complemento, numero)
         VALUES ($1, $2, LOWER($3), $4, 'Dono', $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          data.nome.trim(),
          data.cpf.trim(),
          data.email.trim(),
          senhaHash,
          data.telefone ?? '',
          data.genero ?? '',
          data.dataDeNascimento || null,
          data.cep ?? '',
          data.rua ?? '',
          data.cidade ?? '',
          data.estado ?? '',
          data.complemento ?? '',
          data.numero ?? 0,
        ],
        );
        const [row] = (
          await client.query<RowDataPacket & { nome: string; email: string; cargo: Cargo }>(
            `SELECT nome, email, cargo FROM funcionario WHERE id_funcionario = $1`,
            [result.insertId],
          )
        ).rows;
        if (!row) throw new InternalServerErrorException('Não foi possível recuperar o funcionário criado.');
        return {
          idFuncionario: result.insertId,
          nome: row.nome,
          email: row.email,
          cargo: row.cargo,
        };
      } finally {
        await client.query("SELECT RELEASE_LOCK('medo_funcionario_bootstrap')");
      }
    });
  }

  async issueToken(user: AuthenticatedUser): Promise<string> {
    return this.jwt.signAsync({
      sub: user.idFuncionario,
      email: user.email,
      nome: user.nome,
    });
  }

  async findUser(id: number): Promise<AuthenticatedUser> {
    const [row] = await this.db.query<RowDataPacket & {
      idFuncionario: string;
      nome: string;
      email: string;
      cargo: Cargo;
    }>(
      `SELECT id_funcionario AS \`idFuncionario\`, nome, email, cargo
       FROM funcionario WHERE id_funcionario = $1 AND status = 'ativo'`,
      [id],
    );
    if (!row) throw new UnauthorizedException('Funcionário inativo ou inexistente.');
    return {
      idFuncionario: Number(row.idFuncionario),
      nome: row.nome,
      email: row.email,
      cargo: row.cargo,
    };
  }

  private toUser(employee: EmployeeRow): AuthenticatedUser {
    return {
      idFuncionario: Number(employee.idFuncionario),
      nome: employee.nome,
      email: employee.email,
      cargo: employee.cargo,
    };
  }
}
