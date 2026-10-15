import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from './auth.types.js';
import { REQUIRED_PERMISSION } from './require-permission.decorator.js';
import type { Permissao } from './roles.js';
import { temPermissao } from './roles.js';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.getAllAndOverride<Permissao>(REQUIRED_PERMISSION, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permission) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!temPermissao(request.user.cargo, permission)) {
      throw new ForbiddenException('Seu cargo não permite realizar esta operação.');
    }
    return true;
  }
}
