import type { Request } from 'express';
import type { Cargo } from './roles.js';

export interface AuthenticatedUser {
  /** Identificador persistente usado como sujeito (sub) no JWT. */
  idFuncionario: number;
  email: string;
  nome: string;
  /** Cargo carregado do banco e usado pelo PermissionGuard nas autorizações. */
  cargo: Cargo;
}

/**
 * Request Express enriquecida pelo AuthGuard após validar o cookie e consultar
 * o funcionário ativo. Rotas protegidas podem então confiar em request.user.
 */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  cookies: Record<string, string | undefined>;
}
