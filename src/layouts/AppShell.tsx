import { NavLink, Outlet } from "react-router-dom";
import { useApp } from "../hooks/useApp";

const NOME_DA_LOJA = "Nome da Loja";

// Moldura das telas logadas: trilho verde (início / perfil), barra superior
// com loja e funcionário logado, e o logo no rodapé — como no protótipo.
function AppShell() {
    const { usuario } = useApp();

    return (
        <div className="shell">
            <aside className="trilho">
                <NavLink to="/app" end className="trilho-botao" title="Início">
                    ⌂
                </NavLink>

                <NavLink to="/app/perfil" className="trilho-botao" title="Meu perfil">
                    👤
                </NavLink>
            </aside>

            <div className="shell-principal">
                <header className="barra-superior">
                    <span>{NOME_DA_LOJA}</span>
                    <NavLink to="/app/perfil" className="barra-usuario">
                        {usuario?.nome}
                    </NavLink>
                </header>

                <main className="shell-conteudo">
                    <Outlet />
                </main>

                <footer className="rodape">MeDo</footer>
            </div>
        </div>
    );
}

export default AppShell;
