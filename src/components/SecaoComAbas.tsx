import { NavLink, Outlet } from "react-router-dom";

export interface Aba {
    rotulo: string;
    para: string;
}

// Barra de abas das telas "Financeiro e Estoque" e "Dashboards e Gestão".
function SecaoComAbas({ abas }: { abas: Aba[] }) {
    return (
        <>
            <nav className="abas">
                {abas.map((aba) => (
                    <NavLink
                        key={aba.para}
                        to={aba.para}
                        className={({ isActive }) => (isActive ? "aba ativa" : "aba")}
                    >
                        {aba.rotulo}
                    </NavLink>
                ))}
            </nav>

            <div className="conteudo-aba">
                <Outlet />
            </div>
        </>
    );
}

export default SecaoComAbas;
