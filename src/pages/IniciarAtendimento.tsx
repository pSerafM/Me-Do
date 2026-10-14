import { useState } from "react";
import Modal from "../components/Modal";
import ClienteForm from "../components/ClienteForm";
import PagamentoModal from "../components/PagamentoModal";
import { useApp } from "../hooks/useApp";
import { Cliente } from "../models/Cliente";
import { ItemPedido } from "../models/ItemPedido";
import { Pedido } from "../models/Pedido";
import { moeda } from "../utils/formatadores";

//parte mais complexa da manipulação de pedido pq tem o fluxo de estados 

const DETALHES_VAZIOS = { modelo: "", marca: "", numeroSerie: "", estado: "", observacao: "", foto: "" };

function IniciarAtendimento() {
    const { clientes, servicos, cadastrarCliente, criarPedido, registrarPagamento } = useApp();

    const [busca, setBusca] = useState("");
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [iniciado, setIniciado] = useState(false);
    const [modalCliente, setModalCliente] = useState(false);

    const [buscaServico, setBuscaServico] = useState("");
    const [selecionados, setSelecionados] = useState<number[]>([]);
    const [detalhes, setDetalhes] = useState(DETALHES_VAZIOS);
    const [itens, setItens] = useState<ItemPedido[]>([]);

    const [pedidoCriado, setPedidoCriado] = useState<Pedido | null>(null);
    const [pagando, setPagando] = useState(false);

    const servicosAtivos = servicos
        .filter((servico) => servico.status)
        .filter((servico) =>
            `${servico.nome} ${servico.descricao}`
                .toLowerCase()
                .includes(buscaServico.trim().toLowerCase())
        );

    const total = itens.reduce((soma, item) => soma + item.valorCobrado(), 0);

    //uma das formas de iniciar atendimento é buscar por um cliente já cadastrado
    function buscarCliente() { 
        const termo = busca.trim().toLowerCase();

        if (!termo) {
            alert("Digite nome, CPF ou telefone do cliente.");
            return;
        }

        const encontrado = clientes.find(
            (c) =>
                c.nome.toLowerCase().includes(termo) ||
                c.cpfCnpj.includes(termo) ||
                c.telefone.includes(termo)
        );

        if (!encontrado) {
            alert("Cliente não encontrado. Use \"Novo Cliente\" para cadastrar.");
            return;
        }

        setCliente(encontrado);
    }

    async function aoCadastrarCliente(novo: Cliente): Promise<string | null> {
        const result = await cadastrarCliente(novo);
        if (typeof result === "string") return result;
        setCliente(result);
        setModalCliente(false);
        return null;
    }

    function alternarServico(id: number) {
        setSelecionados((atuais) =>
            atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id]
        );
    }

    function adicionar() {
        if (selecionados.length === 0) {
            alert("Selecione ao menos um serviço.");
            return;
        }

        if (!detalhes.modelo.trim()) {
            alert("Informe o modelo do produto.");
            return;
        }

        const novos = servicos
            .filter((servico) => selecionados.includes(servico.id))
            .map(
                (servico) =>
                    new ItemPedido(
                        servico,
                        detalhes.modelo.trim(),
                        detalhes.marca.trim(),
                        detalhes.numeroSerie.trim(),
                        detalhes.estado.trim(),
                        detalhes.observacao.trim(),
                        detalhes.foto //guarda apenas o nome do arquivo de foto
                    )
            );

        setItens([...itens, ...novos]);
        setSelecionados([]);
        setDetalhes(DETALHES_VAZIOS);
    }

    async function gerarOS() {
        if (!cliente || itens.length === 0) {
            return;
        }

        const pedido = new Pedido(0, cliente, itens[0].servico, itens);
        try {
            setPedidoCriado(await criarPedido(pedido));
        } catch (error) {
            alert(error instanceof Error ? error.message : "Não foi possível criar o pedido.");
        }
    }

    function reiniciar() {
        setBusca("");
        setCliente(null);
        setIniciado(false); //estado false de iniciado ao reiniciar
        setBuscaServico("");
        setSelecionados([]);
        setDetalhes(DETALHES_VAZIOS);
        setItens([]);
        setPedidoCriado(null);
        setPagando(false);
    }

    async function pagarEntrada(
        valor: number,
        forma: Parameters<typeof registrarPagamento>[2]
    ) {
        if (!pedidoCriado) {
            return;
        }

        const erro = await registrarPagamento(pedidoCriado.id, valor, forma);

        if (erro) {
            alert(erro);
            return;
        }

        reiniciar();
    }

    return (
        <div className="atendimento">
            {/* ---------- Cliente ---------- */}
            <section className="painel">
                <div className="painel-titulo painel-titulo-linha">
                    <h2>Cliente</h2>
                    <input
                        list="sugestao-clientes"
                        className="busca"
                        placeholder="Pesquisar Cliente"
                        value={busca}
                        disabled={iniciado}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                    <datalist id="sugestao-clientes">
                        {clientes.map((c) => (
                            <option key={c.id} value={c.nome} />
                        ))}
                    </datalist>
                    <button
                        type="button"
                        className="btn btn-primario btn-quadrado"
                        title="Buscar"
                        disabled={iniciado}
                        onClick={buscarCliente}
                    >
                        ✓
                    </button>
                    <button
                        type="button"
                        className="btn btn-claro"
                        disabled={iniciado}
                        onClick={() => setModalCliente(true)}
                    >
                        + Novo Cliente
                    </button>
                </div>

                <div className="painel-corpo">
                    <div className="grade-3">
                        <div className="campo">
                            <label>Nome Completo:</label>
                            <input readOnly value={cliente?.nome ?? ""} />
                        </div>
                        <div className="campo">
                            <label>CPF:</label>
                            <input readOnly value={cliente?.cpfCnpj ?? ""} />
                        </div>
                        <div className="campo">
                            <label>Telefone:</label>
                            <input readOnly value={cliente?.telefone ?? ""} />
                        </div>
                    </div>

                    <div className="centro">
                        {iniciado ? ( //reseta a tela de atendimento, nada foi gravado. O pedido só é registrado no banco de dados depois da função gerarOS
                            <button type="button" className="btn btn-neutro" onClick={reiniciar}>
                                Cancelar Atendimento
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-neutro"
                                disabled={!cliente}
                                onClick={() => setIniciado(true)} //mudança do estado de iniciado para true ao iniciar o atendimento
                            >
                                Iniciar Atendimento
                            </button>
                        )}
                    </div>
                </div>
            </section>
            
            <fieldset className="etapas-atendimento" disabled={!iniciado}> 
                {/* fieldset disabled --> esabilita nativamente todos os campos da erapa seguinte do atendimento */}
                {/* Serviço */}
                <section className="painel">
                    <div className="painel-titulo painel-titulo-linha">
                        <h2>Serviço</h2>
                        <input
                            className="busca"
                            placeholder="Pesquisar Serviço"
                            value={buscaServico}
                            onChange={(e) => setBuscaServico(e.target.value)}
                        />
                    </div>

                    <div className="painel-corpo sem-padding">
                        <table className="tabela">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Serviço</th>
                                    <th>Descrição</th>
                                    <th>Valor</th>
                                    <th>Prazo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {servicosAtivos.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="vazio">
                                            Nenhum serviço disponível. Cadastre em Dashboards e Gestão &gt; Gerência de Serviços.
                                        </td>
                                    </tr>
                                )}
                                {servicosAtivos.map((servico) => (//selecao de serviços registrados
                                    <tr key={servico.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selecionados.includes(servico.id)}
                                                onChange={() => alternarServico(servico.id)}
                                            />
                                        </td>
                                        <td>{servico.nome}</td>
                                        <td>{servico.descricao}</td>
                                        <td>{moeda(servico.valor)}</td>
                                        <td>{servico.horasEstimadas}h</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Detalhes do Serviço: exige pelo menos um serviço e um modelo de item a receber o serviço preenchidos para criar um pedido (ItemPedido) */}
                <section className="painel">
                    <h2 className="painel-titulo">Detalhes do Serviço</h2>

                    <div className="painel-corpo">
                        <div className="grade-4">
                            <div className="campo">
                                <label>Modelo</label>
                                <input
                                    value={detalhes.modelo}
                                    onChange={(e) => setDetalhes({ ...detalhes, modelo: e.target.value })}
                                />
                            </div>
                            <div className="campo">
                                <label>Marca</label>
                                <input
                                    value={detalhes.marca}
                                    onChange={(e) => setDetalhes({ ...detalhes, marca: e.target.value })}
                                />
                            </div>
                            <div className="campo">
                                <label>Nº de Série</label>
                                <input
                                    value={detalhes.numeroSerie}
                                    onChange={(e) => setDetalhes({ ...detalhes, numeroSerie: e.target.value })}
                                />
                            </div>
                            <div className="campo">
                                <label>Estado</label>
                                <input
                                    value={detalhes.estado}
                                    onChange={(e) => setDetalhes({ ...detalhes, estado: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="campo">
                            <label>Observação</label>
                            <textarea
                                rows={3}
                                value={detalhes.observacao}
                                onChange={(e) => setDetalhes({ ...detalhes, observacao: e.target.value })}
                            />
                        </div>

                        <div className="centro linha-botoes">
                            <label className="btn btn-claro">
                                {detalhes.foto ? `Foto: ${detalhes.foto}` : "Anexar Foto"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) =>
                                        setDetalhes({ ...detalhes, foto: e.target.files?.[0]?.name ?? "" })
                                    }
                                />
                            </label>
                            <button type="button" className="btn btn-claro" onClick={adicionar}>
                                Adicionar
                            </button>
                        </div>
                    </div>
                </section>

                {/* Resumo: listar itens do pedido com a alternativa de remover */}
                <section className="painel">
                    <h2 className="painel-titulo">Resumo</h2>

                    <div className="painel-corpo sem-padding">
                        <table className="tabela">
                            <thead>
                                <tr>
                                    <th>Serviço</th>
                                    <th>Modelo</th>
                                    <th>Prazo</th>
                                    <th>Valor</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {itens.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="vazio">
                                            Nenhum serviço adicionado.
                                        </td>
                                    </tr>
                                )}
                                {itens.map((item, indice) => (
                                    <tr key={indice}>
                                        <td>{item.servico.nome}</td>
                                        <td>{item.modelo}</td>
                                        <td>{item.horasEstimadas()}h</td>
                                        <td>{moeda(item.valorCobrado())}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn-icone btn-icone-perigo"
                                                title="Remover"
                                                onClick={() => setItens(itens.filter((_, i) => i !== indice))}
                                            >
                                                🗑
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </fieldset>

            <div className="barra-total">
                <strong>{moeda(total)}</strong>
                <button
                    type="button"
                    className="btn btn-claro"
                    disabled={!iniciado || itens.length === 0}
                    onClick={gerarOS} //monta o new Pedido(0, cliente, itens[0].servico, itens e chama criarPedido
                >
                    Gerar e Enviar OS
                </button>
            </div>

            {modalCliente && (
                <Modal titulo="Cadastro de Cliente" icone="+" onFechar={() => setModalCliente(false)}>
                    <ClienteForm onClienteCadastrado={aoCadastrarCliente} />
                </Modal>
            )}

            {pedidoCriado && !pagando && ( //Pedido Cadastrado: pergunta se quer apagar na entrada do pedido, se sim ent direciona para a parte de pagamento ou reinicia a aba de iniciar atendimento
                <Modal titulo="Pedido Cadastrado" icone="+" onFechar={reiniciar}>
                    <p className="centro">
                        OS #{pedidoCriado.id} gerada ({moeda(pedidoCriado.valorTotal)}).
                        <br />
                        Deseja realizar pagamento agora?
                    </p>
                    <div className="acoes-form">
                        <button type="button" className="btn btn-primario" onClick={() => setPagando(true)}>
                            Sim
                        </button>
                        <button type="button" className="btn btn-perigo" onClick={reiniciar}>
                            Não
                        </button>
                    </div>
                </Modal>
            )}

            {pedidoCriado && pagando && (
                <PagamentoModal
                    titulo="Pagamento de Entrada"
                    valorInicial={pedidoCriado.valorTotal}
                    onConfirmar={pagarEntrada}
                    onFechar={reiniciar}
                />
            )}
        </div>
    );
}

export default IniciarAtendimento;
