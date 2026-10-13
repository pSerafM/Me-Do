import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../hooks/useApp";

// Só deixa entrar em /app/* quem passou pelo login da Landing Page.
function RotaProtegida() {
    const { usuario, carregandoSessao } = useApp();

    if (carregandoSessao) return <p className="carregando">Verificando sessão…</p>;
    return usuario ? <Outlet /> : <Navigate to="/" replace />;
}

export default RotaProtegida;
