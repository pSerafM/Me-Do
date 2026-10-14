import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";

// "Mudança de Login de Funcionário"
function Perfil() {
    const { usuario, atualizarUsuario, logout } = useApp();
    const navigate = useNavigate();
    const [editando, setEditando] = useState(false);
    const [nome, setNome] = useState(usuario?.nome ?? "");
    const [email, setEmail] = useState(usuario?.email ?? "");
    const [novaSenha, setNovaSenha] = useState("");

    async function salvar() {
        if (!nome.trim() || !email.trim()) {
            alert("Nome e e-mail são obrigatórios.");
            return;
        }

        if (novaSenha && novaSenha.length < 12) {
            alert("A senha deve ter pelo menos 12 caracteres.");
            return;
        }
        const erro = await atualizarUsuario(
            {
                idFuncionario: usuario?.idFuncionario ?? 0,
                nome: nome.trim(),
                email: email.trim(),
                cargo: usuario?.cargo ?? "Atendente"
            },
            novaSenha || undefined
        );
        if (erro) {
            alert(erro);
            return;
        }
        setNovaSenha("");
        setEditando(false);
    }

    async function sair() {
        await logout();
        navigate("/");
    }

    return (
        <section className="perfil">
            <div className="avatar">{(usuario?.nome ?? "?").charAt(0).toUpperCase()}</div>

            <div className="campo">
                <label>Nome Completo:</label>
                <input value={nome} disabled={!editando} onChange={(e) => setNome(e.target.value)} />
            </div>

            <div className="campo">
                <label>E-mail:</label>
                <input
                    type="email"
                    value={email}
                    disabled={!editando}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="campo">
                <label>Cargo:</label>
                <input value={usuario?.cargo ?? ""} readOnly />
            </div>

            <div className="campo">
                <label>Senha:</label>
                <input
                    type="password"
                    value={editando ? novaSenha : "**************"}
                    placeholder="Nova senha"
                    disabled={!editando}
                    onChange={(e) => setNovaSenha(e.target.value)}
                />
            </div>

            {editando ? (
                <button type="button" className="btn btn-navy" onClick={salvar}>
                    Salvar
                </button>
            ) : (
                <button type="button" className="btn btn-navy" onClick={() => setEditando(true)}>
                    Editar
                </button>
            )}

            <button type="button" className="btn btn-perigo" onClick={sair}>
                Sair
            </button>
        </section>
    );
}

export default Perfil;
