import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../database/database.service.js';
import type { AuthenticatedRequest, AuthenticatedUser } from './auth.types.js';
import { isCargo } from './roles.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly db: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    // O cookie é criado no login/bootstrap; sem ele a rota protegida não tem identidade de sessão.
    const token = request.cookies?.access_token;
    if (!token) throw new UnauthorizedException('Sessão ausente ou expirada.');

    let employeeId: number;
    try {
      // Além da assinatura, verifica validade/expiração e garante que o sujeito seja um ID válido.
      const payload = await this.jwt.verifyAsync<{ sub: number }>(token);
      employeeId = Number(payload.sub);
      if (!Number.isSafeInteger(employeeId) || employeeId < 1) {
        throw new UnauthorizedException();
      }
    } catch {
      throw new UnauthorizedException('Sessão ausente ou expirada.');
    }

    // Recarrega o funcionário para aplicar status e cargo atuais em cada requisição,
    // inclusive alterações feitas depois que o JWT foi emitido.
    const [employee] = await this.db.query<RowDataPacket & {
      idFuncionario: string;
      nome: string;
      email: string;
      cargo: string;
    }>(
      `SELECT id_funcionario AS \`idFuncionario\`, nome, email, cargo
       FROM funcionario WHERE id_funcionario = $1 AND status = 'ativo'`,
      [employeeId],
    );
    if (!employee) throw new UnauthorizedException('Funcionário inativo ou inexistente.');
    if (!isCargo(employee.cargo)) {
      throw new ForbiddenException('O cargo do funcionário não está configurado corretamente.');
    }

    request.user = {
      idFuncionario: Number(employee.idFuncionario),
      email: employee.email,
      nome: employee.nome,
      cargo: employee.cargo,
    } satisfies AuthenticatedUser;
    // Nest continua para o controller somente após identidade e cargo terem sido validados.
    return true;
  }
}
