import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { PermissionGuard } from '../auth/permission.guard.js';
import { ApiController } from './api.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [ApiController],
  providers: [AuthGuard, PermissionGuard],
})
export class ApiModule {}
