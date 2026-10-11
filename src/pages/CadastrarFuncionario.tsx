import { useNavigate } from "react-router-dom";
import FuncionarioForm from "../components/FuncionarioForm";
import { useApp } from "../hooks/useApp";

function CadastrarFuncionario() {
    const { cadastrarFuncionario } = useApp();
    const navigate = useNavigate();

    return (
        <section className="ficha-funcionario">
            <h2>Cadastrar Funcionário</h2>

            <FuncionarioForm
                modo="cadastro"
                onSalvar={(dados) => {
                    const erro = cadastrarFuncionario(dados);

                    if (!erro) {
                        // TODO: enviar e-mail de definição de senha (UC01 / UC13).
                        navigate("/app/gestao/funcionarios");
                    }

                    return erro;
                }}
            />
        </section>
    );
}

export default CadastrarFuncionario;
