import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { BootstrapDto, LoginDto } from './auth.dto.js';
import type { AuthenticatedRequest, AuthenticatedUser } from './auth.types.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('bootstrap')
  async bootstrap(@Body() data: BootstrapDto, @Res({ passthrough: true }) response: Response) {
    // Primeiro cria o funcionário inicial; em seguida inicia sua sessão como em um login.
    const user = await this.auth.bootstrap(data);
    await this.setSession(user, response);
    return { user };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() data: LoginDto, @Res({ passthrough: true }) response: Response) {
    // A resposta contém o usuário para a interface; o token é enviado somente no cookie.
    const user = await this.auth.login(data.email, data.senha);
    await this.setSession(user, response);
    return { user };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() request: AuthenticatedRequest) {
    // Confirma a sessão e retorna dados atuais do banco, não apenas o conteúdo do JWT.
    return { user: await this.auth.findUser(request.user.idFuncionario) };
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) response: Response): void {
    // Remove do navegador o mesmo cookie usado para estabelecer a sessao.
    response.clearCookie('access_token', this.cookieOptions());
  }

  private async setSession(user: AuthenticatedUser, response: Response): Promise<void> {
    const token = await this.auth.issueToken(user);
    // HttpOnly impede leitura pelo JavaScript; o navegador envia o cookie nas chamadas à API.
    response.cookie('access_token', token, {
      ...this.cookieOptions(),
      maxAge: 8 * 60 * 60 * 1000,
    });
  }

  private cookieOptions() {
    // Opções alinhadas também no clearCookie para o navegador remover o mesmo cookie.
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/api',
    };
  }
}
