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
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CARGOS } from '../auth/roles.js';
import { IsValidCpfCnpjConstraint } from './document-validator.js';

export class ClienteDto {
  @IsString() @IsNotEmpty() nome!: string;
  @IsString() @IsNotEmpty() @Validate(IsValidCpfCnpjConstraint) cpfCnpj!: string;
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
  // Campos aceitos para cada serviço/produto associado a uma ordem de serviço.
  @IsInt() @Min(1) servicoId!: number;
  @IsOptional() @IsString() modelo?: string;
  @IsOptional() @IsString() marca?: string;
  @IsOptional() @IsString() numeroSerie?: string;
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsString() observacao?: string;
  @IsOptional() @IsString() foto?: string;
  // A API só aceita valores correspondentes às estratégias suportadas e salvas no ENUM SQL.
  @IsOptional() @IsIn(['preco_fixo', 'hora_tecnica', 'orcamento'])
  tipoCobranca?: 'preco_fixo' | 'hora_tecnica' | 'orcamento';
}

export class CriarPedidoDto {
  // O cliente e o serviço principal devem existir; itens detalha os serviços associados.
  @IsInt() @Min(1) clienteId!: number;
  @IsInt() @Min(1) servicoId!: number;
  // Opções legadas para pedido sem lista detalhada de itens.
  @IsOptional() @IsIn(['preco_fixo', 'hora_tecnica', 'orcamento'])
  tipoCobranca?: 'preco_fixo' | 'hora_tecnica' | 'orcamento';
  // Whitelist do tipo de processamento escolhido na tela de criação.
  @IsOptional() @IsIn(['comum', 'urgente', 'garantia'])
  tipoProcessamento?: 'comum' | 'urgente' | 'garantia';
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

export class OrcamentoServicoDto {
  // Identifica qual relação pedido_servico o técnico está orçando.
  @IsInt() @Min(1) idPedidoServico!: number;
  // Null limpa o orçamento e faz a API usar como alternativa o preço do serviço.
  @IsOptional() @IsNumber() @Min(0) valor!: number | null;
}

export class SalvarLaudoDto {
  // O técnico envia o laudo, os insumos consumidos e, opcionalmente, o próximo progresso.
  @IsString() @MinLength(1) laudo!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => InsumoUsadoDto)
  insumos!: InsumoUsadoDto[];
  // Orçamentos usam o mesmo DTO validado antes de qualquer gravação na transação.
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => OrcamentoServicoDto)
  orcamentos?: OrcamentoServicoDto[];
  @IsOptional()
  @IsIn(['iniciar', 'pausa', 'concluir', 'pronto'])
  progresso?: 'iniciar' | 'pausa' | 'concluir' | 'pronto' | null;
}

export class CancelarPedidoDto {
  // O cancelamento exige uma justificativa que também será registrada no histórico.
  @IsString() @MinLength(1) motivo!: string;
}

export class PagamentoDto {
  // Cada pagamento é um lançamento independente ligado ao pedido.
  @IsNumber() @Min(0.01) valor!: number;
  @IsIn(['pix', 'credito', 'debito', 'dinheiro'])
  forma!: 'pix' | 'credito' | 'debito' | 'dinheiro';
}

export class FinalizarPedidoDto {
  // A forma só é obrigatória se ainda houver saldo a pagar na retirada.
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
