import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import type { Permissao } from "../auth/permissions";
import { temPermissao } from "../auth/permissions";

function RotaComPermissao({ permissao }: { permissao: Permissao }) {
    const { usuario } = useApp();

    return usuario && temPermissao(usuario.cargo, permissao) ? (
        <Outlet />
    ) : (
        <Navigate to="/app" replace />
    );
}

export default RotaComPermissao;
