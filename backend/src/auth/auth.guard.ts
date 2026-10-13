import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthenticatedRequest, AuthenticatedUser } from './auth.types.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.access_token;
    if (!token) throw new UnauthorizedException('Sessão ausente ou expirada.');

    try {
      const payload = await this.jwt.verifyAsync<{
        sub: number;
        email: string;
        nome: string;
      }>(token);
      request.user = {
        idFuncionario: payload.sub,
        email: payload.email,
        nome: payload.nome,
      } satisfies AuthenticatedUser;
      return true;
    } catch {
      throw new UnauthorizedException('Sessão ausente ou expirada.');
    }
  }
}
