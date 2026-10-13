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
                onSalvar={(dados, senha) => {
                    if (!senha) return "Informe uma senha inicial.";
                    return cadastrarFuncionario(dados, senha).then((erro) => {
                        if (!erro) navigate("/app/gestao/funcionarios");
                        return erro;
                    });
                }}
            />
        </section>
    );
}

export default CadastrarFuncionario;
