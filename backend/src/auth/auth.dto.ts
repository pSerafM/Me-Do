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
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  senha!: string;
}

export class BootstrapDto {
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
