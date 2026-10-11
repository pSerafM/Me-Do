import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { AppContext } from "./AppContext";
import type {
    DadosServico,
    FormaPagamento,
    InsumoUsado,
    Progresso,
    TipoMovimentacao,
    Usuario
} from "./AppContext";
import type { Cliente } from "../models/Cliente";
import type { Servico } from "../models/Servico";
import { Insumo } from "../models/Insumo";
import { ItemInsumo } from "../models/itemInsumo";
import type { Funcionario } from "../models/Funcionario";
import { Despesa } from "../models/Despezas";
import { NotaFiscal } from "../models/NotaFiscal";
import { Checkout } from "../models/Checkout";
import { ROTULO_ETAPA } from "../models/Pedido";
import type { EtapaOS, Pedido } from "../models/Pedido";
import { Estoque } from "../models/Estoque";
import { ProcessarPedidoComum } from "../services/ProcessarPedidoComum";
import { GeradorNotaFiscal } from "../services/GeradorNotaFiscal";

// Mesmo comportamento de antes: quando aplicar Strategy/Factory,
// a escolha do processador entra aqui.
const processadorPedido = new ProcessarPedidoComum();

// Ordem das colunas do Kanban.
const ETAPAS_KANBAN: EtapaOS[] = [
    "aberto",
    "analise",
    "aguardando_insumo",
    "manutencao",
    "pronto_retirada"
];

const AVISO_WHATSAPP = "Cliente notificado via WhatsApp (simulado).";

export function AppProvider({ children }: { children: ReactNode }) {
    const estoque = Estoque.getInstancia();

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [insumos, setInsumos] = useState<Insumo[]>(() => estoque.listarInsumos());
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [despesas, setDespesas] = useState<Despesa[]>([]);
    const [notas, setNotas] = useState<NotaFiscal[]>([]);
    const ultimoIdPedido = useRef(0);

    // Os objetos de domínio são mutáveis; depois de alterar um, geramos um
    // array novo para o React renderizar de novo.
    const atualizarPedidos = () => setPedidos((atuais) => [...atuais]);
    const atualizarInsumos = () => setInsumos(estoque.listarInsumos());
    const atualizarNotas = () => setNotas((atuais) => [...atuais]);

    const nomeUsuario = usuario?.nome ?? "Sistema";

    function acharPedido(id: number): Pedido | undefined {
        return pedidos.find((pedido) => pedido.id === id);
    }

    // ---------- sessão ----------
    function login(email: string, senha: string): boolean {
        if (!email.trim() || !senha) {
            return false;
        }

        // TODO: autenticação real (JWT). Por enquanto qualquer login válido entra.
        const funcionario = funcionarios.find((f) => f.email === email.trim());

        setUsuario({
            nome: funcionario?.nome ?? email.split("@")[0],
            email: email.trim()
        });

        return true;
    }

    function logout() {
        setUsuario(null);
    }

    function atualizarUsuario(dados: Usuario) {
        setUsuario(dados);
    }

    // ---------- clientes ----------
    function cadastrarCliente(cliente: Cliente) {
        setClientes((atuais) => [...atuais, cliente]);
    }

    // ---------- serviços ----------
    function nomeServicoDuplicado(nome: string, ignorarId?: number): boolean {
        return servicos.some(
            (s) =>
                s.id !== ignorarId &&
                s.nome.trim().toLowerCase() === nome.trim().toLowerCase()
        );
    }

    function cadastrarServico(servico: Servico): string | null {
        if (nomeServicoDuplicado(servico.nome)) {
            return "Já existe um serviço com esse nome.";
        }

        setServicos((atuais) => [...atuais, servico]);
        return null;
    }

    function alterarServico(id: number, dados: Partial<DadosServico>): string | null {
        const servico = servicos.find((s) => s.id === id);

        if (!servico) {
            return "Serviço não encontrado.";
        }

        if (dados.nome !== undefined && nomeServicoDuplicado(dados.nome, id)) {
            return "Já existe um serviço com esse nome.";
        }

        if (dados.nome !== undefined) servico.nome = dados.nome;
        if (dados.valor !== undefined) servico.valor = dados.valor;
        if (dados.horasEstimadas !== undefined) servico.horasEstimadas = dados.horasEstimadas;
        if (dados.descricao !== undefined) servico.descricao = dados.descricao;
        if (dados.status !== undefined) {
            if (dados.status) {
                servico.ativar();
            } else {
                servico.desativar();
            }
        }

        setServicos((atuais) => [...atuais]);
        return null;
    }

    // ---------- estoque ----------
    function cadastrarInsumo(insumo: Insumo): string | null {
        const duplicado = estoque
            .listarInsumos()
            .some(
                (existente) =>
                    (insumo.sku && existente.sku === insumo.sku) ||
                    existente.nome.trim().toLowerCase() === insumo.nome.trim().toLowerCase()
            );

        if (duplicado) {
            return "Esse insumo já está registrado.";
        }

        estoque.adicionarInsumo(insumo);
        atualizarInsumos();
        return null;
    }

    function movimentarEstoque(
        idInsumo: number,
        tipo: TipoMovimentacao,
        quantidade: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _observacao: string
    ): string | null {
        const insumo = estoque.buscarPorId(idInsumo);

        if (!insumo) {
            return "Insumo não encontrado.";
        }

        if (Number.isNaN(quantidade) || quantidade < 0 || (tipo !== "ajuste" && quantidade === 0)) {
            return "Informe uma quantidade válida.";
        }

        if (tipo === "entrada") {
            insumo.atualizarQuantidade(insumo.quantidade + quantidade);
        } else if (tipo === "saida") {
            if (quantidade > insumo.quantidade) {
                return "Quantidade maior que o estoque disponível.";
            }
            insumo.atualizarQuantidade(insumo.quantidade - quantidade);
        } else {
            insumo.atualizarQuantidade(quantidade);
        }

        atualizarInsumos();
        return null;
    }

    // ---------- pedidos / ordens de serviço ----------
    function criarPedido(pedido: Pedido): Pedido {
        ultimoIdPedido.current += 1;
        pedido.id = ultimoIdPedido.current;

        const processado = processadorPedido.processar(pedido);

        processado.registrarLog(
            nomeUsuario,
            "Pedido aberto",
            `Ordem de serviço aberta para ${processado.cliente.nome} com ${
                processado.itens.length || 1
            } serviço(s). ${AVISO_WHATSAPP}`
        );

        setPedidos((atuais) => [...atuais, processado]);
        return processado;
    }

    function moverEtapa(idPedido: number, direcao: 1 | -1): string | null {
        const pedido = acharPedido(idPedido);

        if (!pedido) {
            return "Pedido não encontrado.";
        }

        const posicao = ETAPAS_KANBAN.indexOf(pedido.etapa);
        const nova = ETAPAS_KANBAN[posicao + direcao];

        if (posicao < 0 || !nova) {
            return null;
        }

        if (direcao === 1 && posicao >= 1 && !pedido.laudoTecnico.trim()) {
            return "Preencha a descrição técnica (laudo) antes de avançar o pedido.";
        }

        const anterior = pedido.etapa;
        pedido.alterarEtapa(nova);
        pedido.registrarLog(
            nomeUsuario,
            ROTULO_ETAPA[nova],
            `Etapa alterada de "${ROTULO_ETAPA[anterior]}" para "${ROTULO_ETAPA[nova]}". ${AVISO_WHATSAPP}`
        );

        atualizarPedidos();
        return null;
    }

    function salvarDescricaoTecnica(
        idPedido: number,
        laudo: string,
        novosInsumos: InsumoUsado[],
        progresso: Progresso | null
    ): string | null {
        const pedido = acharPedido(idPedido);

        if (!pedido) {
            return "Pedido não encontrado.";
        }

        if (!laudo.trim()) {
            return "Preencha o laudo técnico / parecer.";
        }

        // valida o estoque antes de alterar qualquer coisa
        for (const usado of novosInsumos) {
            const insumo = estoque.buscarPorId(usado.idInsumo);

            if (!insumo) {
                return "Insumo não encontrado.";
            }

            if (usado.quantidade <= 0 || Number.isNaN(usado.quantidade)) {
                return `Informe uma quantidade válida para ${insumo.nome}.`;
            }

            if (usado.quantidade > insumo.quantidade) {
                return `Estoque insuficiente de ${insumo.nome} (disponível: ${insumo.quantidade}).`;
            }
        }

        novosInsumos.forEach((usado, indice) => {
            const insumo = estoque.buscarPorId(usado.idInsumo)!;
            insumo.atualizarQuantidade(insumo.quantidade - usado.quantidade);
            pedido.insumosUsados.push(
                new ItemInsumo(
                    Date.now() + indice,
                    pedido.id,
                    insumo.id,
                    usado.quantidade,
                    insumo.precoCusto
                )
            );
        });

        pedido.laudoTecnico = laudo.trim();

        let detalhe = laudo.trim();
        if (novosInsumos.length > 0) {
            detalhe += ` (insumos adicionados: ${novosInsumos.length})`;
        }

        let novaEtapa: EtapaOS | null = null;
        if (progresso === "iniciar") novaEtapa = "manutencao";
        if (progresso === "pausa") novaEtapa = "aguardando_insumo";
        if (progresso === "pronto") novaEtapa = "pronto_retirada";
        if (progresso === "concluir") detalhe += " — Reparo concluído.";

        pedido.registrarLog(nomeUsuario, "Descrição técnica atualizada", detalhe);

        if (novaEtapa && novaEtapa !== pedido.etapa) {
            pedido.alterarEtapa(novaEtapa);
            pedido.registrarLog(
                nomeUsuario,
                ROTULO_ETAPA[novaEtapa],
                `Etapa alterada para "${ROTULO_ETAPA[novaEtapa]}". ${AVISO_WHATSAPP}`
            );
        }

        atualizarPedidos();
        atualizarInsumos();
        return null;
    }

    function cancelarPedido(idPedido: number, motivo: string): string | null {
        const pedido = acharPedido(idPedido);

        if (!pedido) {
            return "Pedido não encontrado.";
        }

        if (!motivo.trim()) {
            return "Informe o motivo do cancelamento.";
        }

        pedido.alterarEtapa("cancelado");
        pedido.motivoCancelamento = motivo.trim();
        pedido.registrarLog(nomeUsuario, "Pedido cancelado", motivo.trim());

        atualizarPedidos();
        return null;
    }

    // ---------- checkout ----------
    function registrarPagamento(
        idPedido: number,
        valor: number,
        forma: FormaPagamento
    ): string | null {
        const pedido = acharPedido(idPedido);

        if (!pedido) {
            return "Pedido não encontrado.";
        }

        if (valor > pedido.saldo() + 0.005) {
            return "O valor é maior que o saldo restante do pedido.";
        }

        try {
            const funcionario = funcionarios.find((f) => f.email === usuario?.email);
            const pagamento = new Checkout(
                pedido.id,
                funcionario?.idFuncionario ?? 0,
                valor,
                forma,
                new Date()
            );
            pagamento.registrarPagamento();
            pedido.pagamentos.push(pagamento);
        } catch (erro) {
            return erro instanceof Error ? erro.message : "Pagamento inválido.";
        }

        pedido.registrarLog(
            nomeUsuario,
            "Pagamento registrado",
            `Pagamento de R$ ${valor.toFixed(2)} (${forma}).`
        );

        atualizarPedidos();
        return null;
    }

    function emitirNota(pedido: Pedido) {
        const numero = GeradorNotaFiscal.getInstancia().gerarNumero();
        const nota = new NotaFiscal(Date.now(), pedido.id, numero, "1", new Date(), "");
        nota.gerarChaveAcesso();

        setNotas((atuais) => [...atuais, nota]);

        // Simula o retorno da SEFAZ.
        setTimeout(() => {
            nota.status = "autorizada";
            atualizarNotas();
        }, 2000);
    }

    function finalizarPedido(idPedido: number, forma: FormaPagamento = "dinheiro"): string | null {
        const pedido = acharPedido(idPedido);

        if (!pedido) {
            return "Pedido não encontrado.";
        }

        if (pedido.etapa === "cancelado") {
            pedido.encerrado = true;
            pedido.registrarLog(nomeUsuario, "Cancelamento encerrado", "Atendimento finalizado no checkout.");
            atualizarPedidos();
            return null;
        }

        if (pedido.saldo() > 0.005) {
            const erro = registrarPagamento(idPedido, pedido.saldo(), forma);

            if (erro) {
                return erro;
            }
        }

        pedido.alterarEtapa("retirado");
        pedido.dataConclusao = new Date();
        pedido.finalizar();
        pedido.registrarLog(nomeUsuario, "Pedido retirado", "Produto entregue ao cliente.");

        emitirNota(pedido);
        atualizarPedidos();
        return null;
    }

    function reenviarNota(idNota: number) {
        const nota = notas.find((n) => n.idNotaFiscal === idNota);

        if (!nota) {
            return;
        }

        nota.status = "em_processamento";
        nota.mensagemErro = "";
        atualizarNotas();

        setTimeout(() => {
            nota.status = "autorizada";
            atualizarNotas();
        }, 2000);
    }

    // ---------- despesas ----------
    function registrarDespesa(categoria: string, valor: number, vencimento: Date) {
        const despesa = new Despesa(Date.now(), categoria, valor, vencimento, "pendente");
        setDespesas((atuais) => [despesa, ...atuais]);
    }

    function pagarDespesa(idDespesa: number) {
        const despesa = despesas.find((d) => d.idDespesa === idDespesa);

        if (despesa) {
            despesa.pagar();
            setDespesas((atuais) => [...atuais]);
        }
    }

    // ---------- funcionários ----------
    function cadastrarFuncionario(funcionario: Funcionario): string | null {
        if (funcionarios.some((f) => f.email === funcionario.email)) {
            return "Já existe um funcionário com esse e-mail.";
        }

        setFuncionarios((atuais) => [...atuais, funcionario]);
        return null;
    }

    function atualizarFuncionario(id: number, dados: Partial<Funcionario>): string | null {
        const funcionario = funcionarios.find((f) => f.idFuncionario === id);

        if (!funcionario) {
            return "Funcionário não encontrado.";
        }

        if (
            dados.email &&
            funcionarios.some((f) => f.idFuncionario !== id && f.email === dados.email)
        ) {
            return "Já existe um funcionário com esse e-mail.";
        }

        Object.assign(funcionario, dados);
        setFuncionarios((atuais) => [...atuais]);
        return null;
    }

    function excluirFuncionario(id: number) {
        setFuncionarios((atuais) => atuais.filter((f) => f.idFuncionario !== id));
    }

    return (
        <AppContext.Provider
            value={{
                usuario,
                login,
                logout,
                atualizarUsuario,
                clientes,
                servicos,
                insumos,
                pedidos,
                funcionarios,
                despesas,
                notas,
                cadastrarCliente,
                cadastrarServico,
                alterarServico,
                cadastrarInsumo,
                movimentarEstoque,
                criarPedido,
                moverEtapa,
                salvarDescricaoTecnica,
                cancelarPedido,
                registrarPagamento,
                finalizarPedido,
                reenviarNota,
                registrarDespesa,
                pagarDespesa,
                cadastrarFuncionario,
                atualizarFuncionario,
                excluirFuncionario
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
