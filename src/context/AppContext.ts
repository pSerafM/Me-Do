import { createContext } from "react";
import type { Cliente } from "../models/Cliente";
import type { Servico } from "../models/Servico";
import type { Insumo } from "../models/Insumo";
import type { Pedido } from "../models/Pedido";
import type { Funcionario } from "../models/Funcionario";
import type { Despesa } from "../models/Despezas";
import type { NotaFiscal } from "../models/NotaFiscal";
import type { Cargo } from "../auth/permissions";
import type { TipoProcessamentoPedido } from "../services/EstrategiaProcessamentoPedido";

export interface Usuario {
    idFuncionario: number;
    nome: string;
    email: string;
    cargo: Cargo;
}

export type TipoMovimentacao = "entrada" | "saida" | "ajuste";
export type FormaPagamento = "pix" | "credito" | "debito" | "dinheiro";
// Passos da barra "Progresso" do modal de descrição técnica.
export type Progresso = "iniciar" | "pausa" | "concluir" | "pronto";

export interface InsumoUsado {
    idInsumo: number;
    quantidade: number;
}

export interface OrcamentoServico {
    // ID da linha em pedido_servico, não o ID geral do serviço do catálogo.
    idPedidoServico: number;
    // null limpa o orçamento e instrui a API a usar o preço cadastrado.
    valor: number | null;
}

export interface DadosServico {
    nome: string;
    valor: number;
    horasEstimadas: number;
    descricao: string;
    status?: boolean;
}

// Funções que validam devolvem a mensagem de erro, ou null quando deu certo.
export interface AppContextData {
    usuario: Usuario | null;
    carregandoSessao: boolean;
    login: (email: string, senha: string) => Promise<string | null>;
    logout: () => Promise<void>;
    atualizarUsuario: (dados: Usuario, senha?: string) => Promise<string | null>;

    clientes: Cliente[];
    servicos: Servico[];
    insumos: Insumo[];
    pedidos: Pedido[];
    funcionarios: Funcionario[];
    despesas: Despesa[];
    notas: NotaFiscal[];

    cadastrarCliente: (cliente: Cliente) => Promise<Cliente | string>;

    cadastrarServico: (servico: Servico) => Promise<string | null>;
    alterarServico: (id: number, dados: Partial<DadosServico>) => Promise<string | null>;

    cadastrarInsumo: (insumo: Insumo) => Promise<string | null>;
    movimentarEstoque: (
        idInsumo: number,
        tipo: TipoMovimentacao,
        quantidade: number,
        observacao: string
    ) => Promise<string | null>;

    // Contrato do domínio: as telas escolhem o processamento e a API cuida da persistência.
    criarPedido: (pedido: Pedido, tipoProcessamento: TipoProcessamentoPedido) => Promise<Pedido>;
    moverEtapa: (idPedido: number, direcao: 1 | -1) => Promise<string | null>;
    salvarDescricaoTecnica: (
        idPedido: number,
        laudo: string,
        novosInsumos: InsumoUsado[],
        progresso: Progresso | null,
        // Orçamentos seguem junto com laudo/insumos para validação e atualização atômicas.
        orcamentos: OrcamentoServico[]
    ) => Promise<string | null>;
    cancelarPedido: (idPedido: number, motivo: string) => Promise<string | null>;

    registrarPagamento: (
        idPedido: number,
        valor: number,
        forma: FormaPagamento
    ) => Promise<string | null>;
    finalizarPedido: (idPedido: number, forma?: FormaPagamento) => Promise<string | null>;
    reenviarNota: (idNota: number) => Promise<string | null>;

    registrarDespesa: (categoria: string, valor: number, vencimento: Date) => Promise<string | null>;
    pagarDespesa: (idDespesa: number) => Promise<string | null>;

    cadastrarFuncionario: (funcionario: Funcionario, senha: string) => Promise<string | null>;
    atualizarFuncionario: (id: number, dados: Partial<Funcionario>) => Promise<string | null>;
    excluirFuncionario: (id: number) => Promise<string | null>;
}

export const AppContext = createContext<AppContextData | null>(null);
