import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import type { RowDataPacket } from 'mysql2/promise';
import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { DatabaseService, type SqlValue } from '../database/database.service.js';
import {
  AtualizarFuncionarioDto,
  CancelarPedidoDto,
  ClienteDto,
  CriarPedidoDto,
  DespesaDto,
  EstoqueDto,
  FinalizarPedidoDto,
  FuncionarioDto,
  MovimentacaoDto,
  MoverEtapaDto,
  PagamentoDto,
  SalvarLaudoDto,
  ServicoDto,
} from './api.dto.js';

const ETAPAS: readonly string[] = [
  'aberto',
  'analise',
  'aguardando_insumo',
  'manutencao',
  'pronto_retirada',
];

interface InventoryRow extends RowDataPacket {
  id: string;
  nome: string;
  quantidade: string;
  unidade: string;
  sku: string;
  categoria: string;
  precoCusto: string;
  quantidadeMinima: string;
}

@Controller()
@UseGuards(AuthGuard)
export class ApiController {
  constructor(private readonly db: DatabaseService) {}

  @Get('clientes')
  listarClientes() {
    return this.db.query(
      `SELECT id, nome, cpf_cnpj AS \`cpfCnpj\`, telefone
       FROM cliente ORDER BY nome`,
    );
  }

  @Post('clientes')
  async cadastrarCliente(@Body() dto: ClienteDto) {
    try {
      const result = await this.db.execute(
        `INSERT INTO cliente (nome, cpf_cnpj, telefone)
         VALUES ($1, $2, $3)`,
        [dto.nome.trim(), dto.cpfCnpj.trim(), dto.telefone.trim()],
      );
      const [cliente] = await this.db.query(
        `SELECT id, nome, cpf_cnpj AS \`cpfCnpj\`, telefone FROM cliente WHERE id = $1`,
        [result.insertId],
      );
      return cliente;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Já existe um cliente com esse CPF/CNPJ.');
      }
      throw error;
    }
  }

  @Get('servicos')
  listarServicos() {
    return this.db.query(
      `SELECT id, nome, valor,
              horas_estimadas AS \`horasEstimadas\`, descricao, status
       FROM servico ORDER BY nome`,
    );
  }

  @Post('servicos')
  async cadastrarServico(@Body() dto: ServicoDto) {
    try {
      const result = await this.db.execute(
        `INSERT INTO servico (nome, valor, horas_estimadas, descricao, status)
         VALUES ($1, $2, $3, $4, COALESCE($5, true))
         `,
        [dto.nome.trim(), dto.valor, dto.horasEstimadas, dto.descricao, dto.status ?? null],
      );
      const [servico] = await this.db.query(
        `SELECT id, nome, valor, horas_estimadas AS \`horasEstimadas\`, descricao, status
         FROM servico WHERE id = $1`,
        [result.insertId],
      );
      return servico;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Já existe um serviço com esse nome.');
      }
      throw error;
    }
  }

  @Patch('servicos/:id')
  async atualizarServico(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<ServicoDto>,
  ) {
    const columns: Record<string, string> = {
      nome: 'nome',
      valor: 'valor',
      horasEstimadas: 'horas_estimadas',
      descricao: 'descricao',
      status: 'status',
    };
    const values: SqlValue[] = [];
    const sets = Object.entries(dto).flatMap(([key, value]) => {
      const column = columns[key];
      if (!column || value === undefined) return [];
      values.push(typeof value === 'string' && key === 'nome' ? value.trim() : value);
      return [`${column} = $${values.length}`];
    });
    if (!sets.length) throw new BadRequestException('Informe ao menos um campo para atualizar.');
    values.push(id);
    try {
      await this.db.execute(
        `UPDATE servico SET ${sets.join(', ')} WHERE id = $${values.length}
         `,
        values,
      );
      const [servico] = await this.db.query(
        `SELECT id, nome, valor, horas_estimadas AS \`horasEstimadas\`, descricao, status
         FROM servico WHERE id = $1`,
        [id],
      );
      if (!servico) throw new NotFoundException('Serviço não encontrado.');
      return servico;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Já existe um serviço com esse nome.');
      }
      throw error;
    }
  }

  @Get('estoque')
  listarEstoque() {
    return this.db.query(
      `SELECT id, nome, quantidade, unidade, sku, categoria,
              preco_custo AS \`precoCusto\`,
              quantidade_minima AS \`quantidadeMinima\`
       FROM estoque ORDER BY nome`,
    );
  }

  @Post('estoque')
  async cadastrarInsumo(@Body() dto: EstoqueDto) {
    const sku = dto.sku?.trim() || null;
    try {
      const result = await this.db.execute(
        `INSERT INTO estoque
           (nome, quantidade, unidade, sku, categoria, preco_custo, quantidade_minima)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          dto.nome.trim(),
          dto.quantidade,
          dto.unidade,
          sku,
          dto.categoria ?? '',
          dto.precoCusto ?? 0,
          dto.quantidadeMinima ?? 0,
        ],
      );
      const [row] = await this.db.query<InventoryRow>(
        `SELECT id, nome, quantidade, unidade, sku, categoria,
                preco_custo AS \`precoCusto\`, quantidade_minima AS \`quantidadeMinima\`
         FROM estoque WHERE id = $1`,
        [result.insertId],
      );
      if (!row) throw new NotFoundException('Não foi possível recuperar o insumo criado.');
      return toInventory(row);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Já existe um insumo com esse SKU.');
      }
      throw error;
    }
  }

  @Post('estoque/:id/movimentacoes')
  async movimentarEstoque(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MovimentacaoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    if (dto.tipo !== 'ajuste' && dto.quantidade === 0) {
      throw new BadRequestException('Informe uma quantidade maior que zero.');
    }
    return this.db.transaction(async (client) => {
      const [stock] = (
        await client.query<InventoryRow>(
          `SELECT id, nome, quantidade, unidade, sku, categoria,
                preco_custo AS \`precoCusto\`,
                quantidade_minima AS \`quantidadeMinima\`
         FROM estoque WHERE id = $1 FOR UPDATE`,
          [id],
        )
      ).rows;
      if (!stock) throw new NotFoundException('Insumo não encontrado.');
      const quantity = Number(stock.quantidade);
      const next =
        dto.tipo === 'entrada'
          ? quantity + dto.quantidade
          : dto.tipo === 'saida'
            ? quantity - dto.quantidade
            : dto.quantidade;
      if (next < 0) throw new BadRequestException('Quantidade maior que o estoque disponível.');

      await client.query('UPDATE estoque SET quantidade = $1 WHERE id = $2', [next, id]);
      await client.query(
        `INSERT INTO estoque_movimentacao
           (estoque_id, funcionario_id, tipo, quantidade, observacao)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, request.user.idFuncionario, dto.tipo, dto.quantidade, dto.observacao ?? ''],
      );
      return toInventory({ ...stock, quantidade: String(next) });
    });
  }

  @Get('funcionarios')
  listarFuncionarios() {
    return this.db.query(
      `SELECT id_funcionario AS \`idFuncionario\`, nome, cpf, telefone, email, genero,
              data_de_nascimento AS \`dataDeNascimento\`, cep, rua, cidade, estado,
              complemento, status, numero
       FROM funcionario ORDER BY nome`,
    );
  }

  @Post('funcionarios')
  async cadastrarFuncionario(@Body() dto: FuncionarioDto) {
    const senhaHash = await hash(dto.senha, 12);
    try {
      const result = await this.db.execute(
        `INSERT INTO funcionario
           (nome, cpf, telefone, email, senha_hash, genero, data_de_nascimento,
            cep, rua, cidade, estado, complemento, numero)
         VALUES ($1, $2, $3, LOWER($4), $5, $6, $7, $8, $9, $10, $11, $12, $13)
         `,
        [
          dto.nome.trim(),
          dto.cpf.trim(),
          dto.telefone ?? '',
          dto.email.trim(),
          senhaHash,
          dto.genero ?? '',
          dto.dataDeNascimento || null,
          dto.cep ?? '',
          dto.rua ?? '',
          dto.cidade ?? '',
          dto.estado ?? '',
          dto.complemento ?? '',
          dto.numero ?? 0,
        ],
      );
      const [employee] = await this.db.query(
        `SELECT id_funcionario AS \`idFuncionario\`, nome, cpf, telefone, email, genero,
                data_de_nascimento AS \`dataDeNascimento\`, cep, rua, cidade, estado,
                complemento, status, numero
         FROM funcionario WHERE id_funcionario = $1`,
        [result.insertId],
      );
      return employee;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('CPF ou e-mail já cadastrado.');
      }
      throw error;
    }
  }

  @Patch('funcionarios/:id')
  async atualizarFuncionario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarFuncionarioDto,
  ) {
    const senhaHash = dto.senha ? await hash(dto.senha, 12) : undefined;
    const columns: Record<string, string> = {
      nome: 'nome',
      cpf: 'cpf',
      telefone: 'telefone',
      email: 'email',
      genero: 'genero',
      dataDeNascimento: 'data_de_nascimento',
      cep: 'cep',
      rua: 'rua',
      cidade: 'cidade',
      estado: 'estado',
      complemento: 'complemento',
      numero: 'numero',
    };
    const values: SqlValue[] = [];
    const sets = Object.entries(dto).flatMap(([key, value]) => {
      if (key === 'senha' && senhaHash) {
        values.push(senhaHash);
        return [`senha_hash = $${values.length}`];
      }
      const column = columns[key];
      if (!column || value === undefined) return [];
      values.push(
        key === 'email' ? String(value).trim().toLowerCase() : value,
      );
      return [`${column} = $${values.length}`];
    });
    if (!sets.length) throw new BadRequestException('Informe ao menos um campo para atualizar.');
    values.push(id);
    try {
      await this.db.execute(
        `UPDATE funcionario SET ${sets.join(', ')} WHERE id_funcionario = $${values.length}
         `,
        values,
      );
      const [employee] = await this.db.query(
        `SELECT id_funcionario AS \`idFuncionario\`, nome, cpf, telefone, email, genero,
                data_de_nascimento AS \`dataDeNascimento\`, cep, rua, cidade, estado,
                complemento, status, numero
         FROM funcionario WHERE id_funcionario = $1`,
        [id],
      );
      if (!employee) throw new NotFoundException('Funcionário não encontrado.');
      return employee;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('CPF ou e-mail já cadastrado.');
      }
      throw error;
    }
  }

  @Post('funcionarios/:id/inativar')
  async excluirFuncionario(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    if (id === request.user.idFuncionario) {
      throw new BadRequestException('Não é possível inativar o próprio funcionário.');
    }
    const result = await this.db.execute(
      `UPDATE funcionario SET status = 'inativo'
       WHERE id_funcionario = $1 AND status = 'ativo'`,
      [id],
    );
    if (result.affectedRows === 0) throw new NotFoundException('Funcionário não encontrado ou já inativo.');
    return { success: true };
  }

  @Get('pedidos')
  listarPedidos() {
    return this.db.query(
      `SELECT
         p.id,
         JSON_OBJECT('id', c.id, 'nome', c.nome, 'cpfCnpj', c.cpf_cnpj,
                     'telefone', c.telefone) AS cliente,
         JSON_OBJECT('id', s.id, 'nome', s.nome, 'valor', s.valor,
                     'horasEstimadas', s.horas_estimadas,
                     'descricao', s.descricao, 'status', s.status) AS servico,
         p.status, p.valor_total AS \`valorTotal\`, p.etapa,
         p.data_abertura AS \`dataAbertura\`, p.data_previsao AS \`dataPrevisao\`,
         p.data_conclusao AS \`dataConclusao\`, p.laudo_tecnico AS \`laudoTecnico\`,
         p.motivo_cancelamento AS \`motivoCancelamento\`, p.encerrado,
         COALESCE((
           SELECT JSON_ARRAYAGG(JSON_OBJECT(
             'servico', JSON_OBJECT('id', iserv.id, 'nome', iserv.nome,
               'valor', iserv.valor, 'horasEstimadas', iserv.horas_estimadas,
               'descricao', iserv.descricao, 'status', iserv.status),
             'modelo', pi.modelo, 'marca', pi.marca, 'numeroSerie', pi.numero_serie,
             'estado', pi.estado, 'observacao', pi.observacao, 'foto', pi.foto
           ))
           FROM pedido_servico psi
           JOIN servico iserv ON iserv.id = psi.servico_id
           LEFT JOIN pedido_item pi ON pi.pedido_servico_id = psi.id
           WHERE psi.pedido_id = p.id AND pi.id IS NOT NULL
         ), JSON_ARRAY()) AS itens,
         COALESCE((
           SELECT JSON_ARRAYAGG(JSON_OBJECT(
             'idItemInsumo', pin.id, 'idPedido', pin.pedido_id,
             'idInsumo', pin.estoque_id, 'quantidadeUsada', pin.quantidade_usada,
             'valorUnitario', pin.valor_unitario
           ))
           FROM pedido_insumo pin WHERE pin.pedido_id = p.id
         ), JSON_ARRAY()) AS \`insumosUsados\`,
         COALESCE((
           SELECT JSON_ARRAYAGG(JSON_OBJECT(
             'idPedido', co.pedido_id, 'idFuncionario', co.funcionario_id,
             'valorPago', co.valor_pago, 'formaPagamento', co.forma_pagamento,
             'dataPagamento', co.data_pagamento
           ))
           FROM checkout co WHERE co.pedido_id = p.id
         ), JSON_ARRAY()) AS pagamentos,
         COALESCE((
           SELECT JSON_ARRAYAGG(JSON_OBJECT(
             'data', l.data, 'funcionario', l.funcionario_nome,
             'titulo', l.titulo, 'descricao', l.descricao
           ))
           FROM \`log\` l WHERE l.pedido_id = p.id
         ), JSON_ARRAY()) AS log
       FROM pedido p
       JOIN cliente c ON c.id = p.cliente_id
       JOIN servico s ON s.id = p.servico_id
       ORDER BY p.data_abertura DESC, p.id DESC`,
    );
  }

  @Post('pedidos')
  async criarPedido(@Body() dto: CriarPedidoDto, @Req() request: AuthenticatedRequest) {
    return this.db.transaction(async (client) => {
      const serviceIds = dto.itens.length ? dto.itens.map((item) => item.servicoId) : [dto.servicoId];
      const serviceRows = await client.query<RowDataPacket & {
        id: string;
        valor: string;
        horasEstimadas: string;
      }>(
        `SELECT id, valor, horas_estimadas AS \`horasEstimadas\`
         FROM servico WHERE id IN (${serviceIds.map((_, index) => `$${index + 1}`).join(', ')})
           AND status = true`,
        serviceIds,
      );
      if (serviceRows.rows.length !== new Set(serviceIds).size) {
        throw new BadRequestException('Um ou mais serviços não foram encontrados ou estão inativos.');
      }
      const services = new Map(serviceRows.rows.map((row) => [Number(row.id), row]));
      const total = serviceIds.reduce(
        (sum, id) => sum + Number(services.get(id)?.valor ?? 0),
        0,
      );
      const hours = serviceIds.reduce(
        (sum, id) => sum + Number(services.get(id)?.horasEstimadas ?? 0),
        0,
      );
      const [customer] = (
        await client.query<RowDataPacket & { nome: string }>('SELECT nome FROM cliente WHERE id = $1', [
          dto.clienteId,
        ])
      ).rows;
      if (!customer) throw new NotFoundException('Cliente não encontrado.');
      const orderResult = await client.query(
          `INSERT INTO pedido
             (cliente_id, servico_id, valor_total, data_previsao, laudo_tecnico, motivo_cancelamento)
           VALUES ($1, $2, $3, $4, '', '')`,
          [
            dto.clienteId,
            serviceIds[0],
            total,
            new Date(Date.now() + hours * 3_600_000),
          ],
        );
      const orderId = orderResult.insertId;
      for (let index = 0; index < serviceIds.length; index++) {
        const serviceId = serviceIds[index];
        const service = services.get(serviceId);
        if (!service) throw new BadRequestException('Serviço não encontrado.');
        const item = dto.itens[index];
        const serviceOrder = await client.query(
            `INSERT INTO pedido_servico (pedido_id, servico_id, valor_cobrado)
             VALUES ($1, $2, $3)`,
            [orderId, serviceId, service.valor],
          );
        if (item) {
          await client.query(
            `INSERT INTO pedido_item
               (pedido_servico_id, modelo, marca, numero_serie, estado, observacao, foto)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              serviceOrder.insertId,
              item.modelo ?? '',
              item.marca ?? '',
              item.numeroSerie ?? '',
              item.estado ?? '',
              item.observacao ?? '',
              item.foto ?? '',
            ],
          );
        }
      }
      await addLog(
        client,
        orderId,
        request,
        'Pedido aberto',
        `Ordem de serviço aberta para ${customer.nome} com ${serviceIds.length} serviço(s).`,
      );
      return { id: Number(orderId) };
    });
  }

  @Patch('pedidos/:id/etapa')
  async moverEtapa(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MoverEtapaDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.db.transaction(async (client) => {
      const [order] = (
        await client.query<RowDataPacket & { etapa: string; laudoTecnico: string }>(
          `SELECT etapa, laudo_tecnico AS \`laudoTecnico\`
           FROM pedido WHERE id = $1 FOR UPDATE`,
          [id],
        )
      ).rows;
      if (!order) throw new NotFoundException('Pedido não encontrado.');
      const position = ETAPAS.indexOf(order.etapa);
      const next = ETAPAS[position + dto.direcao];
      if (position < 0 || !next) throw new BadRequestException('O pedido já está nesta etapa final.');
      if (dto.direcao === 1 && position >= 1 && !order.laudoTecnico.trim()) {
        throw new BadRequestException('Preencha a descrição técnica antes de avançar o pedido.');
      }
      await client.query('UPDATE pedido SET etapa = $1 WHERE id = $2', [next, id]);
      await addLog(client, id, request, next, `Etapa alterada de "${order.etapa}" para "${next}".`);
      return { etapa: next };
    });
  }

  @Post('pedidos/:id/laudo')
  async salvarLaudo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SalvarLaudoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.db.transaction(async (client) => {
      const [order] = (
        await client.query<RowDataPacket & { etapa: string }>('SELECT etapa FROM pedido WHERE id = $1 FOR UPDATE', [id])
      ).rows;
      if (!order) throw new NotFoundException('Pedido não encontrado.');

      for (const used of dto.insumos) {
        const [stock] = (
          await client.query<InventoryRow>(
            `SELECT id, nome, quantidade, unidade, sku, categoria,
                    preco_custo AS \`precoCusto\`,
                    quantidade_minima AS \`quantidadeMinima\`
             FROM estoque WHERE id = $1 FOR UPDATE`,
            [used.idInsumo],
          )
        ).rows;
        if (!stock) throw new NotFoundException('Insumo não encontrado.');
        const available = Number(stock.quantidade);
        if (used.quantidade > available) {
          throw new BadRequestException(
            `Estoque insuficiente de ${stock.nome} (disponível: ${available}).`,
          );
        }
        await client.query('UPDATE estoque SET quantidade = quantidade - $1 WHERE id = $2', [
          used.quantidade,
          used.idInsumo,
        ]);
        await client.query(
          `INSERT INTO pedido_insumo (pedido_id, estoque_id, quantidade_usada, valor_unitario)
           VALUES ($1, $2, $3, $4)`,
          [id, used.idInsumo, used.quantidade, stock.precoCusto],
        );
      }

      let nextStage: string | null = null;
      if (dto.progresso === 'iniciar') nextStage = 'manutencao';
      if (dto.progresso === 'pausa') nextStage = 'aguardando_insumo';
      if (dto.progresso === 'pronto') nextStage = 'pronto_retirada';

      await client.query(
        `UPDATE pedido SET laudo_tecnico = $1, etapa = COALESCE($2, etapa) WHERE id = $3`,
        [dto.laudo.trim(), nextStage, id],
      );
      const extra = dto.insumos.length ? ` (insumos adicionados: ${dto.insumos.length})` : '';
      const completed = dto.progresso === 'concluir' ? ' — Reparo concluído.' : '';
      await addLog(
        client,
        id,
        request,
        'Descrição técnica atualizada',
        `${dto.laudo.trim()}${extra}${completed}`,
      );
      if (nextStage && nextStage !== order.etapa) {
        await addLog(client, id, request, nextStage, `Etapa alterada para "${nextStage}".`);
      }
      return { success: true };
    });
  }

  @Post('pedidos/:id/cancelamento')
  async cancelarPedido(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelarPedidoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.db.transaction(async (client) => {
      const [order] = (
        await client.query<RowDataPacket & { etapa: string }>('SELECT etapa FROM pedido WHERE id = $1 FOR UPDATE', [id])
      ).rows;
      if (!order) throw new NotFoundException('Pedido não encontrado.');
      if (order.etapa === 'retirado') {
        throw new BadRequestException('Um pedido já retirado não pode ser cancelado.');
      }
      await client.query(
        `UPDATE pedido SET etapa = 'cancelado', motivo_cancelamento = $1 WHERE id = $2`,
        [dto.motivo.trim(), id],
      );
      await addLog(client, id, request, 'Pedido cancelado', dto.motivo.trim());
      return { success: true };
    });
  }

  @Post('pedidos/:id/pagamentos')
  async registrarPagamento(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PagamentoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.db.transaction(async (client) => {
      const [order] = (
        await client.query<RowDataPacket & { valorTotal: string; etapa: string }>(
          `SELECT valor_total AS \`valorTotal\`, etapa
           FROM pedido WHERE id = $1 FOR UPDATE`,
          [id],
        )
      ).rows;
      if (!order) throw new NotFoundException('Pedido não encontrado.');
      if (order.etapa === 'cancelado' || order.etapa === 'retirado') {
        throw new BadRequestException('Não é possível pagar um pedido encerrado.');
      }
      const [{ totalPago }] = (
        await client.query<RowDataPacket & { totalPago: string }>(
          `SELECT COALESCE(SUM(valor_pago), 0) AS \`totalPago\`
           FROM checkout WHERE pedido_id = $1`,
          [id],
        )
      ).rows;
      const balance = Math.max(Number(order.valorTotal) - Number(totalPago), 0);
      if (dto.valor > balance + 0.005) {
        throw new BadRequestException('O valor é maior que o saldo restante do pedido.');
      }
      await client.query(
        `INSERT INTO checkout (pedido_id, funcionario_id, valor_pago, forma_pagamento)
         VALUES ($1, $2, $3, $4)`,
        [id, request.user.idFuncionario, dto.valor, dto.forma],
      );
      await addLog(
        client,
        id,
        request,
        'Pagamento registrado',
        `Pagamento de R$ ${dto.valor.toFixed(2)} (${dto.forma}).`,
      );
      return { success: true };
    });
  }

  @Post('pedidos/:id/finalizacao')
  async finalizarPedido(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: FinalizarPedidoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.db.transaction(async (client) => {
      const [order] = (
        await client.query<RowDataPacket & { valorTotal: string; etapa: string; status: string }>(
          `SELECT valor_total AS \`valorTotal\`, etapa, status
           FROM pedido WHERE id = $1 FOR UPDATE`,
          [id],
        )
      ).rows;
      if (!order) throw new NotFoundException('Pedido não encontrado.');
      if (order.etapa === 'retirado') return { success: true };
      if (order.etapa === 'cancelado') {
        await client.query('UPDATE pedido SET encerrado = true WHERE id = $1', [id]);
        await addLog(client, id, request, 'Cancelamento encerrado', 'Atendimento finalizado no checkout.');
        return { success: true };
      }

      const [{ totalPago }] = (
        await client.query<RowDataPacket & { totalPago: string }>(
          `SELECT COALESCE(SUM(valor_pago), 0) AS \`totalPago\`
           FROM checkout WHERE pedido_id = $1`,
          [id],
        )
      ).rows;
      const balance = Math.max(Number(order.valorTotal) - Number(totalPago), 0);
      if (balance > 0.005) {
        if (!dto.forma) throw new BadRequestException('Informe a forma de pagamento.');
        await client.query(
          `INSERT INTO checkout (pedido_id, funcionario_id, valor_pago, forma_pagamento)
           VALUES ($1, $2, $3, $4)`,
          [id, request.user.idFuncionario, balance, dto.forma],
        );
        await addLog(
          client,
          id,
          request,
          'Pagamento registrado',
          `Pagamento de R$ ${balance.toFixed(2)} (${dto.forma}).`,
        );
      }

      await client.query(
        `UPDATE pedido
         SET etapa = 'retirado', status = 'finalizado',
             data_conclusao = now(), encerrado = true
         WHERE id = $1`,
        [id],
      );
      await addLog(client, id, request, 'Pedido retirado', 'Produto entregue ao cliente.');
      const [existingInvoice] = (
        await client.query('SELECT id_nota_fiscal FROM nota_fiscal WHERE pedido_id = $1', [id])
      ).rows;
      if (!existingInvoice) {
        const invoice = await client.query(
          `INSERT INTO nota_fiscal
            (pedido_id, serie, data_emissao, chave_acesso, mensagem_erro)
           VALUES ($1, '1', now(), '', '')`,
          [id],
        );
        await client.query(
          `UPDATE nota_fiscal
           SET numero = $1, chave_acesso = $2
           WHERE id_nota_fiscal = $3`,
          [invoice.insertId, `1-${invoice.insertId}-${id}`, invoice.insertId],
        );
      }
      return { success: true };
    });
  }

  @Get('despesas')
  listarDespesas() {
    return this.db.query(
      `SELECT id_despesa AS \`idDespesa\`, descricao, valor,
              data, status FROM despesa_interna ORDER BY data DESC, id_despesa DESC`,
    );
  }

  @Post('despesas')
  async registrarDespesa(@Body() dto: DespesaDto) {
    const result = await this.db.execute(
      `INSERT INTO despesa_interna (descricao, valor, data)
       VALUES ($1, $2, $3)`,
      [dto.descricao.trim(), dto.valor, dto.data],
    );
    const [expense] = await this.db.query(
      `SELECT id_despesa AS \`idDespesa\`, descricao, valor, data, status
       FROM despesa_interna WHERE id_despesa = $1`,
      [result.insertId],
    );
    return expense;
  }

  @Post('despesas/:id/pagamento')
  async pagarDespesa(@Param('id', ParseIntPipe) id: number) {
    const result = await this.db.execute(
      `UPDATE despesa_interna SET status = 'paga' WHERE id_despesa = $1`,
      [id],
    );
    if (result.affectedRows === 0) throw new NotFoundException('Despesa não encontrada.');
    const [expense] = await this.db.query(
      `SELECT id_despesa AS \`idDespesa\`, descricao, valor, data, status
       FROM despesa_interna WHERE id_despesa = $1`,
      [id],
    );
    return expense;
  }

  @Get('notas-fiscais')
  listarNotas() {
    return this.db.query(
      `SELECT id_nota_fiscal AS \`idNotaFiscal\`, pedido_id AS \`idPedido\`,
              numero, serie, data_emissao AS \`dataEmissao\`, chave_acesso AS \`chaveAcesso\`,
              status, mensagem_erro AS \`mensagemErro\`
       FROM nota_fiscal ORDER BY data_emissao DESC`,
    );
  }

  @Post('notas-fiscais/:id/reenvio')
  async reenviarNota(@Param('id', ParseIntPipe) id: number) {
    const result = await this.db.execute(
      `UPDATE nota_fiscal SET status = 'em_processamento', mensagem_erro = ''
       WHERE id_nota_fiscal = $1 AND status = 'com_erro'`,
      [id],
    );
    if (result.affectedRows === 0) {
      throw new BadRequestException('Só é possível reenviar notas fiscais com erro.');
    }
    return { success: true };
  }
}

async function addLog(
  client: import('../database/database.service.js').DatabaseTransaction,
  orderId: number,
  request: AuthenticatedRequest,
  title: string,
  description: string,
): Promise<void> {
  await client.query(
    `INSERT INTO \`log\` (pedido_id, funcionario_id, funcionario_nome, titulo, descricao)
     VALUES ($1, $2, $3, $4, $5)`,
    [orderId, request.user.idFuncionario, request.user.nome, title, description],
  );
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY';
}

function toInventory(row: InventoryRow) {
  return {
    id: Number(row.id),
    nome: row.nome,
    quantidade: Number(row.quantidade),
    unidade: row.unidade,
    sku: row.sku ?? '',
    categoria: row.categoria,
    precoCusto: Number(row.precoCusto),
    quantidadeMinima: Number(row.quantidadeMinima),
  };
}
