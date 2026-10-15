import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class LoginDto {
  /** O class-validator rejeita valores que não tenham formato de endereço de e-mail. */
  @IsEmail()
  email!: string;

  /** Senha fornecida no login; o serviço compara seu valor com o hash armazenado. */
  @IsString()
  @IsNotEmpty()
  senha!: string;
}

export class BootstrapDto {
  /** Segredo de inicialização configurado no servidor, exigido para criar o primeiro Dono. */
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  cpf!: string;

  /** O primeiro funcionário deve ser criado com senha de pelo menos 12 caracteres. */
  @IsString()
  @MinLength(12)
  senha!: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  genero?: string;

  @IsOptional()
  @IsDateString()
  dataDeNascimento?: string;

  @IsOptional()
  @IsString()
  cep?: string;

  @IsOptional()
  @IsString()
  rua?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  numero?: number;
}
