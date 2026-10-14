import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CARGOS } from '../auth/roles.js';

export class ClienteDto {
  @IsString() @IsNotEmpty() nome!: string;
  @IsString() @IsNotEmpty() cpfCnpj!: string;
  @IsString() @IsNotEmpty() telefone!: string;
}

export class ServicoDto {
  @IsString() @IsNotEmpty() nome!: string;
  @IsNumber() @Min(0) valor!: number;
  @IsNumber() @Min(0) horasEstimadas!: number;
  @IsString() descricao!: string;
  @IsOptional() @IsBoolean() status?: boolean;
}

export class EstoqueDto {
  @IsString() nome!: string;
  @IsNumber() @Min(0) quantidade!: number;
  @IsString() unidade!: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() categoria?: string;
  @IsOptional() @IsNumber() @Min(0) precoCusto?: number;
  @IsOptional() @IsNumber() @Min(0) quantidadeMinima?: number;
}

export class MovimentacaoDto {
  @IsIn(['entrada', 'saida', 'ajuste']) tipo!: 'entrada' | 'saida' | 'ajuste';
  @IsNumber() @Min(0) quantidade!: number;
  @IsOptional() @IsString() observacao?: string;
}

export class FuncionarioDto {
  @IsString() @IsNotEmpty() nome!: string;
  @IsString() @IsNotEmpty() cpf!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(12) senha!: string;
  @IsOptional() @IsIn(CARGOS) cargo?: (typeof CARGOS)[number];
  @IsOptional() @IsString() telefone?: string;
  @IsOptional() @IsString() genero?: string;
  @IsOptional() @IsDateString() dataDeNascimento?: string;
  @IsOptional() @IsString() cep?: string;
  @IsOptional() @IsString() rua?: string;
  @IsOptional() @IsString() cidade?: string;
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsString() complemento?: string;
  @IsOptional() @IsInt() @Min(0) numero?: number;
}

export class AtualizarFuncionarioDto {
  @IsOptional() @IsString() nome?: string;
  @IsOptional() @IsString() cpf?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MinLength(12) senha?: string;
  @IsOptional() @IsIn(CARGOS) cargo?: (typeof CARGOS)[number];
  @IsOptional() @IsString() telefone?: string;
  @IsOptional() @IsString() genero?: string;
  @IsOptional() @IsDateString() dataDeNascimento?: string;
  @IsOptional() @IsString() cep?: string;
  @IsOptional() @IsString() rua?: string;
  @IsOptional() @IsString() cidade?: string;
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsString() complemento?: string;
  @IsOptional() @IsInt() @Min(0) numero?: number;
}

export class OrderItemDto {
  @IsInt() @Min(1) servicoId!: number;
  @IsOptional() @IsString() modelo?: string;
  @IsOptional() @IsString() marca?: string;
  @IsOptional() @IsString() numeroSerie?: string;
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsString() observacao?: string;
  @IsOptional() @IsString() foto?: string;
}

export class CriarPedidoDto {
  @IsInt() @Min(1) clienteId!: number;
  @IsInt() @Min(1) servicoId!: number;
  @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  itens!: OrderItemDto[];
}

export class MoverEtapaDto {
  @IsIn([-1, 1]) direcao!: -1 | 1;
}

export class InsumoUsadoDto {
  @IsInt() @Min(1) idInsumo!: number;
  @IsNumber() @Min(0.001) quantidade!: number;
}

export class SalvarLaudoDto {
  @IsString() @MinLength(1) laudo!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => InsumoUsadoDto)
  insumos!: InsumoUsadoDto[];
  @IsOptional()
  @IsIn(['iniciar', 'pausa', 'concluir', 'pronto'])
  progresso?: 'iniciar' | 'pausa' | 'concluir' | 'pronto' | null;
}

export class CancelarPedidoDto {
  @IsString() @MinLength(1) motivo!: string;
}

export class PagamentoDto {
  @IsNumber() @Min(0.01) valor!: number;
  @IsIn(['pix', 'credito', 'debito', 'dinheiro'])
  forma!: 'pix' | 'credito' | 'debito' | 'dinheiro';
}

export class FinalizarPedidoDto {
  @IsOptional()
  @IsIn(['pix', 'credito', 'debito', 'dinheiro'])
  forma?: 'pix' | 'credito' | 'debito' | 'dinheiro';
}

export class DespesaDto {
  @IsString() @IsNotEmpty() descricao!: string;
  @IsNumber() @Min(0.01) valor!: number;
  @IsDateString() data!: string;
}

export class IdParamDto {
  @Type(() => Number) @IsInt() @Min(1) id!: number;
}

export class PedidoIdParamDto {
  @Type(() => Number) @IsInt() @Min(1) id!: number;
}
