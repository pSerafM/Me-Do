import { SetMetadata } from '@nestjs/common';
import type { Permissao } from './roles.js';

export const REQUIRED_PERMISSION = 'requiredPermission';

export function RequirePermission(permission: Permissao) {
  return SetMetadata(REQUIRED_PERMISSION, permission);
}
