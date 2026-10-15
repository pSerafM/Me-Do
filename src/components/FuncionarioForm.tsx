import { useState } from "react";
import type { FormEvent } from "react";
import { Funcionario } from "../models/Funcionario";
import { CARGOS } from "../auth/permissions";
import { deInputData, paraInputData } from "../utils/formatadores";

const UFS = [
    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
    "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

interface FuncionarioFormProps {
    funcionario?: Funcionario;
    modo: "cadastro" | "visualizacao";
    // devolve a mensagem de erro, ou null se salvou
    onSalvar: (dados: Funcionario, senha?: string) => string | null | Promise<string | null>;
    onExcluir?: () => void;
    podeAtribuirCargo?: boolean;
}

function FuncionarioForm({
    funcionario,
    modo,
    onSalvar,
    onExcluir,
    podeAtribuirCargo = false
}: FuncionarioFormProps) {
    const [editando, setEditando] = useState(modo === "cadastro");

    const [nome, setNome] = useState(funcionario?.nome ?? "");
    const [cpf, setCpf] = useState(funcionario?.cpf ?? "");
    const [nascimento, setNascimento] = useState(
        funcionario?.dataDeNascimento ? paraInputData(funcionario.dataDeNascimento) : ""
    );
    const [genero, setGenero] = useState(funcionario?.genero ?? "");
    const [email, setEmail] = useState(funcionario?.email ?? "");
    const [cep, setCep] = useState(funcionario?.cep ?? "");
    const [estado, setEstado] = useState(funcionario?.estado ?? "");
    const [cidade, setCidade] = useState(funcionario?.cidade ?? "");
    const [rua, setRua] = useState(funcionario?.rua ?? "");
    const [numero, setNumero] = useState(funcionario ? String(funcionario.numero) : "");
    const [complemento, setComplemento] = useState(funcionario?.complemento ?? "");
    const [senha, setSenha] = useState("");
    const [cargo, setCargo] = useState(funcionario?.cargo ?? "Atendente");

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!nome.trim() || !cpf.trim() || !email.trim() || !nascimento) {
            alert("Preencha nome, CPF, data de nascimento e e-mail.");
            return;
        }

        const dados = new Funcionario(
            funcionario?.idFuncionario ?? Date.now(),
            nome.trim(),
            cpf.trim(),
            funcionario?.telefone ?? "",
            email.trim(),
            genero,
            deInputData(nascimento),
            cep.trim(),
            rua.trim(),
            cidade.trim(),
            estado,
            complemento.trim(),
            funcionario?.status ?? "ativo",
            Number(numero) || 0,
            cargo
        );

        if (modo === "cadastro" && senha.length < 12) {
            alert("A senha deve ter pelo menos 12 caracteres.");
            return;
        }

        const erro = await onSalvar(dados, senha || undefined);

        if (erro) {
            alert(erro);
            return;
        }

        if (modo === "visualizacao") {
            setEditando(false);
        }
    }

    function cancelarEdicao() {
        // volta para os valores originais
        setNome(funcionario?.nome ?? "");
        setCpf(funcionario?.cpf ?? "");
        setNascimento(funcionario?.dataDeNascimento ? paraInputData(funcionario.dataDeNascimento) : "");
        setGenero(funcionario?.genero ?? "");
        setEmail(funcionario?.email ?? "");
        setCep(funcionario?.cep ?? "");
        setEstado(funcionario?.estado ?? "");
        setCidade(funcionario?.cidade ?? "");
        setRua(funcionario?.rua ?? "");
        setNumero(funcionario ? String(funcionario.numero) : "");
        setComplemento(funcionario?.complemento ?? "");
        setCargo(funcionario?.cargo ?? "Atendente");
        setEditando(false);
    }

    return (
        <form className="form-funcionario" onSubmit={salvar}>
            <fieldset disabled={!editando}>
                <div className="campo c-metade">
                    <label>Nome Completo:</label>
                    <input value={nome} onChange={(e) => setNome(e.target.value)} />
                </div>

                <div className="campo c-metade">
                    <label>CPF:</label>
                    <input value={cpf} onChange={(e) => setCpf(e.target.value)} />
                </div>

                <div className="campo c-metade">
                    <label>Data de Nascimento:</label>
                    <input
                        type="date"
                        value={nascimento}
                        onChange={(e) => setNascimento(e.target.value)}
                    />
                </div>

                <div className="campo c-metade">
                    <label>Gênero:</label>
                    <select value={genero} onChange={(e) => setGenero(e.target.value)}>
                        <option value="">Selecione</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                    </select>
                </div>

                <div className="campo c-inteiro">
                    <label>E-mail:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {modo === "cadastro" && (
                    <div className="campo c-inteiro">
                        <label>Senha inicial (mínimo de 12 caracteres):</label>
                        <input
                            type="password"
                            autoComplete="new-password"
                            value={senha}
                            onChange={(event) => setSenha(event.target.value)}
                        />
                    </div>
                )}

                <div className="campo c-metade">
                    <label htmlFor="cargo-funcionario">Cargo:</label>
                    {podeAtribuirCargo ? (
                        <select
                            id="cargo-funcionario"
                            value={cargo}
                            onChange={(event) => {
                                const selected = CARGOS.find((option) => option === event.target.value);
                                if (selected) setCargo(selected);
                            }}
                        >
                            {CARGOS.map((opcao) => (
                                <option key={opcao} value={opcao}>
                                    {opcao}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input id="cargo-funcionario" value={cargo} readOnly />
                    )}
                </div>

                <div className="campo c-quarto">
                    <label>CEP:</label>
                    <input value={cep} onChange={(e) => setCep(e.target.value)} />
                </div>

                <div className="campo c-quarto">
                    <label>Estado:</label>
                    <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                        <option value="">UF</option>
                        {UFS.map((uf) => (
                            <option key={uf} value={uf}>
                                {uf}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="campo c-metade">
                    <label>Cidade:</label>
                    <input value={cidade} onChange={(e) => setCidade(e.target.value)} />
                </div>

                <div className="campo c-metade">
                    <label>Rua:</label>
                    <input value={rua} onChange={(e) => setRua(e.target.value)} />
                </div>

                <div className="campo c-quarto">
                    <label>Número:</label>
                    <input
                        type="number"
                        min="0"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                    />
                </div>

                <div className="campo c-quarto">
                    <label>Complemento:</label>
                    <input
                        value={complemento}
                        onChange={(e) => setComplemento(e.target.value)}
                    />
                </div>
            </fieldset>

            <div className="acoes-form">
                {modo === "cadastro" && (
                    <button type="submit" className="btn btn-navy">
                        Cadastrar
                    </button>
                )}

                {modo === "visualizacao" && !editando && (
                    <>
                        <button
                            type="button"
                            className="btn btn-primario"
                            onClick={() => setEditando(true)}
                        >
                            Editar
                        </button>
                        <button type="button" className="btn btn-perigo" onClick={onExcluir}>
                            Excluir
                        </button>
                    </>
                )}

                {modo === "visualizacao" && editando && (
                    <>
                        <button type="submit" className="btn btn-primario">
                            Salvar
                        </button>
                        <button type="button" className="btn btn-neutro" onClick={cancelarEdicao}>
                            Cancelar
                        </button>
                    </>
                )}
            </div>
        </form>
    );
}

export default FuncionarioForm;
