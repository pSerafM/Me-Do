import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FuncionarioForm from "../components/FuncionarioForm";
import { useApp } from "../hooks/useApp";

function Funcionarios() {
    const { funcionarios, atualizarFuncionario, excluirFuncionario } = useApp();
    const navigate = useNavigate();
    const [idSelecionado, setIdSelecionado] = useState<number | null>(null);

    const selecionado = funcionarios.find((f) => f.idFuncionario === idSelecionado);

    return (
        <div className="gestao-funcionarios">
            <aside className="lista-funcionarios">
                <h2>Controle de Funcionários</h2>

                <div className="lista-botoes">
                    {funcionarios.length === 0 && <p className="vazio">Nenhum funcionário cadastrado.</p>}

                    {funcionarios.map((funcionario) => (
                        <button
                            key={funcionario.idFuncionario}
                            type="button"
                            className={
                                funcionario.idFuncionario === idSelecionado
                                    ? "btn btn-navy selecionado"
                                    : "btn btn-navy"
                            }
                            onClick={() => setIdSelecionado(funcionario.idFuncionario)}
                        >
                            {funcionario.nome}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    className="btn btn-primario"
                    onClick={() => navigate("/app/gestao/funcionarios/novo")}
                >
                    Cadastrar Novo Funcionário
                </button>
            </aside>

            <section className="ficha-funcionario">
                {selecionado ? (
                    <FuncionarioForm
                        key={selecionado.idFuncionario}
                        modo="visualizacao"
                        funcionario={selecionado}
                        onSalvar={(dados) =>
                            atualizarFuncionario(selecionado.idFuncionario, {
                                nome: dados.nome,
                                cpf: dados.cpf,
                                email: dados.email,
                                genero: dados.genero,
                                dataDeNascimento: dados.dataDeNascimento,
                                cep: dados.cep,
                                rua: dados.rua,
                                cidade: dados.cidade,
                                estado: dados.estado,
                                complemento: dados.complemento,
                                numero: dados.numero
                            })
                        }
                        onExcluir={() => {
                            if (window.confirm(`Excluir ${selecionado.nome} do sistema?`)) {
                                excluirFuncionario(selecionado.idFuncionario);
                                setIdSelecionado(null);
                            }
                        }}
                    />
                ) : (
                    <p className="vazio">Selecione um funcionário para ver os dados.</p>
                )}
            </section>
        </div>
    );
}

export default Funcionarios;
