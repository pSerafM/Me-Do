import type { Request } from 'express';

export interface AuthenticatedUser {
  idFuncionario: number;
  email: string;
  nome: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  cookies: Record<string, string | undefined>;
}
