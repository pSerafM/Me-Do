import { createContext } from "react";
import type { Cliente } from "../models/Cliente";
import type { Servico } from "../models/Servico";
import type { Insumo } from "../models/Insumo";
import type { Pedido } from "../models/Pedido";
import type { Funcionario } from "../models/Funcionario";
import type { Despesa } from "../models/Despezas";
import type { NotaFiscal } from "../models/NotaFiscal";

export interface Usuario {
    nome: string;
    email: string;
}

export type TipoMovimentacao = "entrada" | "saida" | "ajuste";
export type FormaPagamento = "pix" | "credito" | "debito" | "dinheiro";
// Passos da barra "Progresso" do modal de descrição técnica.
export type Progresso = "iniciar" | "pausa" | "concluir" | "pronto";

export interface InsumoUsado {
    idInsumo: number;
    quantidade: number;
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
    login: (email: string, senha: string) => boolean;
    logout: () => void;
    atualizarUsuario: (dados: Usuario) => void;

    clientes: Cliente[];
    servicos: Servico[];
    insumos: Insumo[];
    pedidos: Pedido[];
    funcionarios: Funcionario[];
    despesas: Despesa[];
    notas: NotaFiscal[];

    cadastrarCliente: (cliente: Cliente) => void;

    cadastrarServico: (servico: Servico) => string | null;
    alterarServico: (id: number, dados: Partial<DadosServico>) => string | null;

    cadastrarInsumo: (insumo: Insumo) => string | null;
    movimentarEstoque: (
        idInsumo: number,
        tipo: TipoMovimentacao,
        quantidade: number,
        observacao: string
    ) => string | null;

    criarPedido: (pedido: Pedido) => Pedido;
    moverEtapa: (idPedido: number, direcao: 1 | -1) => string | null;
    salvarDescricaoTecnica: (
        idPedido: number,
        laudo: string,
        novosInsumos: InsumoUsado[],
        progresso: Progresso | null
    ) => string | null;
    cancelarPedido: (idPedido: number, motivo: string) => string | null;

    registrarPagamento: (
        idPedido: number,
        valor: number,
        forma: FormaPagamento
    ) => string | null;
    finalizarPedido: (idPedido: number, forma?: FormaPagamento) => string | null;
    reenviarNota: (idNota: number) => void;

    registrarDespesa: (categoria: string, valor: number, vencimento: Date) => void;
    pagarDespesa: (idDespesa: number) => void;

    cadastrarFuncionario: (funcionario: Funcionario) => string | null;
    atualizarFuncionario: (id: number, dados: Partial<Funcionario>) => string | null;
    excluirFuncionario: (id: number) => void;
}

export const AppContext = createContext<AppContextData | null>(null);
