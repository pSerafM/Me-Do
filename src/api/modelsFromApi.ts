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

export interface ApiServico {
    id: number;
    nome: string;
    valor: number;
    horasEstimadas: number;
    descricao: string;
    status: boolean;
}

export interface ApiPedido {
    id: number;
    cliente: { id: number; nome: string; cpfCnpj: string; telefone: string };
    servico: ApiServico;
    status: string;
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
    const servico = new Servico(
        Number(row.id),
        row.nome,
        Number(row.valor),
        Number(row.horasEstimadas),
        row.descricao
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
    const cliente = reviverCliente(row.cliente);
    const servico = reviverServico(row.servico);
    const itens = row.itens.map((item) =>
        new ItemPedido(
            reviverServico(item.servico),
            item.modelo,
            item.marca,
            item.numeroSerie,
            item.estado,
            item.observacao,
            item.foto
        )
    );
    const pedido = new Pedido(Number(row.id), cliente, servico, itens);
    pedido.status = row.status;
    pedido.valorTotal = Number(row.valorTotal);
    pedido.etapa = row.etapa;
    pedido.dataAbertura = parseDateTime(row.dataAbertura);
    pedido.dataPrevisao = parseDateTime(row.dataPrevisao);
    pedido.dataConclusao = row.dataConclusao ? parseDateTime(row.dataConclusao) : null;
    pedido.laudoTecnico = row.laudoTecnico;
    pedido.motivoCancelamento = row.motivoCancelamento;
    pedido.encerrado = row.encerrado;
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
