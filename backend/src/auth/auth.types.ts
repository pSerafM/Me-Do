import type { Request } from 'express';
import type { Cargo } from './roles.js';

export interface AuthenticatedUser {
  idFuncionario: number;
  email: string;
  nome: string;
  cargo: Cargo;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  cookies: Record<string, string | undefined>;
}
