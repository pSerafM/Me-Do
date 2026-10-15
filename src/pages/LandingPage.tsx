import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";

const RECURSOS = ["Controle Total de Pedidos", "Comunicação Automatizada", "Gestão Financeira Interada"];

function LandingPage() {
    const { login } = useApp();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");

    async function entrar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        const erroLogin = await login(email, senha);
        if (erroLogin) {
            setErro(erroLogin);
            return;
        }

        navigate("/app");
    }

    return (
        <div className="landing">
            <header className="landing-topo">
                <span className="logo">MeDo</span>
                <button
                    type="button"
                    className="btn btn-claro"
                    onClick={() => alert("O cadastro de novas empresas ainda não está disponível.")}
                >
                    Cadastre-se
                </button>
            </header>

            <section className="landing-hero">
                <div className="landing-slogan">
                    <h1>
                        SIMPLIFIQUE SEUS REPAROS.
                        <br />
                        FIDELIZE SEUS CLIENTES.
                    </h1>
                </div>
                <form className="login-card" onSubmit={entrar}>
                    <h2>Login</h2>

                    <div className="campo">
                        <label htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="senha">Senha</label>
                        <input
                            id="senha"
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />
                    </div>

                    {erro && <p className="erro">{erro}</p>}

                    <button type="submit" className="btn btn-primario">
                        Entrar
                    </button>
                </form>
            </section>

            <div className="landing-faixa" />

            <section className="landing-recursos">
                {RECURSOS.map((recurso) => (
                    <div className="recurso" key={recurso}>
                        {recurso}
                    </div>
                ))}
            </section>
        </div>
    );
}

export default LandingPage;
