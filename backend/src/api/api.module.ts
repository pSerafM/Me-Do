import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { PermissionGuard } from '../auth/permission.guard.js';
import { ApiController } from './api.controller.js';
import {
  PayExpenseWorkflow,
  RegisterExpenseWorkflow,
} from './expense-workflow.js';
import { IssueInvoiceWorkflow, RetryInvoiceWorkflow } from './invoice-workflow.js';

@Module({
  // AuthModule disponibiliza os serviços de autenticação usados pelos guards.
  imports: [AuthModule],
  // O controller adapta as requisições HTTP às operações da aplicação.
  controllers: [ApiController],
  providers: [
    AuthGuard,
    PermissionGuard,
    // Registra os workflows para injecao nos endpoints da API.
    RegisterExpenseWorkflow,
    PayExpenseWorkflow,
    IssueInvoiceWorkflow,
    RetryInvoiceWorkflow,
  ],
})
export class ApiModule {}
