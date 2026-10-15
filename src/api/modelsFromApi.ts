import { Cliente } from "../models/Cliente";
import { Checkout } from "../models/Checkout";
import { Despesa } from "../models/Despezas";
import { Funcionario } from "../models/Funcionario";
import { Insumo } from "../models/Insumo";
import { ItemInsumo } from "../models/itemInsumo";
import { ItemPedido } from "../models/ItemPedido";
import { NotaFiscal, type StatusNota } from "../models/NotaFiscal";
import { Pedido, type EtapaOS } from "../models/Pedido";
import { RegistroLog } from "../models/RegistroLog";
import { Servico } from "../models/Servico";
import type { Cargo } from "../auth/permissions";
import type { TipoCobranca } from "../services/EstrategiaCobranca";
import { criarEstrategiaCobranca } from "../services/criarEstrategiaCobranca";
import type { TipoProcessamentoPedido } from "../services/EstrategiaProcessamentoPedido";

export interface ApiServico {
    id: number;
    nome: string;
    valor: number;
    horasEstimadas: number;
    descricao: string;
    status: boolean;
    // Campos opcionais para compatibilidade com respostas que ainda não incluem strategies.
    tipoCobranca?: TipoCobranca;
    valorOrcado?: number | null;
}

export interface ApiPedido {
    // Formato retornado pelo endpoint; contém o pedido e coleções carregadas por relações SQL.
    id: number;
    cliente: { id: number; nome: string; cpfCnpj: string; telefone: string };
    servico: ApiServico;
    status: string;
    // Modalidade selecionada na criação e persistida na coluna tipo_processamento.
    tipoProcessamento: TipoProcessamentoPedido;
    valorTotal: number;
    etapa: EtapaOS;
    dataAbertura: string;
    dataPrevisao: string;
    dataConclusao: string | null;
    laudoTecnico: string;
    motivoCancelamento: string;
    encerrado: boolean;
    itens: {
        servico: ApiServico;
        modelo: string;
        marca: string;
        numeroSerie: string;
        estado: string;
        observacao: string;
        foto: string;
        // ID usado para salvar orçamento técnico na relação correspondente.
        idPedidoServico?: number;
    }[];
    insumosUsados: {
        idItemInsumo: number;
        idPedido: number;
        idInsumo: number;
        quantidadeUsada: number;
        valorUnitario: number;
    }[];
    pagamentos: {
        idPedido: number;
        idFuncionario: number;
        valorPago: number;
        formaPagamento: string;
        dataPagamento: string;
    }[];
    log: { data: string; funcionario: string; titulo: string; descricao: string }[];
}

export function reviverCliente(row: {
    id: number;
    nome: string;
    cpfCnpj: string;
    telefone: string;
}): Cliente {
    return new Cliente(Number(row.id), row.nome, row.cpfCnpj, row.telefone);
}

export function reviverServico(row: ApiServico): Servico {
    // A API manda o tipo e orçamento; o helper converte isso em uma estratégia executável.
    const servico = new Servico(
        Number(row.id),
        row.nome,
        Number(row.valor),
        Number(row.horasEstimadas),
        row.descricao,
        criarEstrategiaCobranca(
            row.tipoCobranca ?? "preco_fixo",
            row.valorOrcado == null ? undefined : Number(row.valorOrcado)
        )
    );
    if (!row.status) servico.desativar();
    return servico;
}

export function reviverInsumo(row: {
    id: number;
    nome: string;
    quantidade: number;
    unidade: string;
    sku: string;
    categoria: string;
    precoCusto: number;
    quantidadeMinima: number;
}): Insumo {
    return new Insumo(
        Number(row.id),
        row.nome,
        Number(row.quantidade),
        row.unidade,
        row.sku,
        row.categoria,
        Number(row.precoCusto),
        Number(row.quantidadeMinima)
    );
}

export function reviverFuncionario(row: {
    idFuncionario: number;
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    genero: string;
    dataDeNascimento: string | null;
    cep: string;
    rua: string;
    cidade: string;
    estado: string;
    complemento: string;
    status: string;
    numero: number;
    cargo: Cargo;
}): Funcionario {
    return new Funcionario(
        Number(row.idFuncionario),
        row.nome,
        row.cpf,
        row.telefone,
        row.email,
        row.genero,
        row.dataDeNascimento ? localCalendarDate(row.dataDeNascimento) : null,
        row.cep,
        row.rua,
        row.cidade,
        row.estado,
        row.complemento,
        row.status,
        Number(row.numero),
        row.cargo
    );
}

export function reviverDespesa(row: {
    idDespesa: number;
    descricao: string;
    valor: number;
    data: string;
    status: string;
}): Despesa {
    return new Despesa(
        Number(row.idDespesa),
        row.descricao,
        Number(row.valor),
        localCalendarDate(row.data),
        row.status
    );
}

export function reviverNota(row: {
    idNotaFiscal: number;
    idPedido: number;
    numero: number;
    serie: string;
    dataEmissao: string;
    chaveAcesso: string;
    status: StatusNota;
    mensagemErro: string;
}): NotaFiscal {
    const nota = new NotaFiscal(
        Number(row.idNotaFiscal),
        Number(row.idPedido),
        Number(row.numero),
        row.serie,
        parseDateTime(row.dataEmissao),
        row.chaveAcesso
    );
    nota.status = row.status;
    nota.mensagemErro = row.mensagemErro;
    return nota;
}

export function reviverPedido(row: ApiPedido): Pedido {
    // Converte o JSON da API em classes de domínio e datas nativas usadas pelas telas.
    const cliente = reviverCliente(row.cliente);
    const servico = reviverServico(row.servico);
    // Cada item reidrata sua própria regra de cobrança e seu ID persistido.
    const itens = row.itens.map((item) =>
        new ItemPedido(
            reviverServico(item.servico),
            item.modelo,
            item.marca,
            item.numeroSerie,
            item.estado,
            item.observacao,
            item.foto,
            item.idPedidoServico
        )
    );
    const pedido = new Pedido(Number(row.id), cliente, servico, itens);
    pedido.status = row.status;
    // Restaura qual estratégia de processamento originou o status do pedido.
    pedido.tipoProcessamento = row.tipoProcessamento;
    pedido.valorTotal = Number(row.valorTotal);
    pedido.etapa = row.etapa;
    pedido.dataAbertura = parseDateTime(row.dataAbertura);
    pedido.dataPrevisao = parseDateTime(row.dataPrevisao);
    pedido.dataConclusao = row.dataConclusao ? parseDateTime(row.dataConclusao) : null;
    pedido.laudoTecnico = row.laudoTecnico;
    pedido.motivoCancelamento = row.motivoCancelamento;
    pedido.encerrado = row.encerrado;
    // Restaura relacionamentos filhos para que saldo, histórico e modais usem modelos tipados.
    pedido.insumosUsados = row.insumosUsados.map(
        (item) =>
            new ItemInsumo(
                Number(item.idItemInsumo),
                Number(item.idPedido),
                Number(item.idInsumo),
                Number(item.quantidadeUsada),
                Number(item.valorUnitario)
            )
    );
    pedido.pagamentos = row.pagamentos.map(
        (item) =>
            new Checkout(
                Number(item.idPedido),
                Number(item.idFuncionario),
                Number(item.valorPago),
                item.formaPagamento,
                parseDateTime(item.dataPagamento)
            )
    );
    pedido.log = row.log.map(
        (item) => new RegistroLog(parseDateTime(item.data), item.funcionario, item.titulo, item.descricao)
    );
    return pedido;
}

export type ApiInsumo = Parameters<typeof reviverInsumo>[0];
export type ApiFuncionario = Parameters<typeof reviverFuncionario>[0];
export type ApiDespesa = Parameters<typeof reviverDespesa>[0];
export type ApiNota = Parameters<typeof reviverNota>[0];

function localCalendarDate(value: string): Date {
    return new Date(`${value.slice(0, 10)}T00:00:00`);
}

function parseDateTime(value: string): Date {
    const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
    return new Date(normalized);
}
export type ApiCliente = Parameters<typeof reviverCliente>[0];
