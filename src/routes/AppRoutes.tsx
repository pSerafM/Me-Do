import { Navigate, Route, Routes } from "react-router-dom";
import RotaProtegida from "./RotaProtegida";
import AppShell from "../layouts/AppShell";
import SecaoComAbas from "../components/SecaoComAbas";

import LandingPage from "../pages/LandingPage";
import Home from "../pages/Home";
import Perfil from "../pages/Perfil";
import IniciarAtendimento from "../pages/IniciarAtendimento";
import OrdensServico from "../pages/OrdensServico";
import Checkout from "../pages/Checkout";
import Despesas from "../pages/Despesas";
import NotaFiscal from "../pages/NotaFiscal";
import Estoque from "../pages/Estoque";
import Dashboard from "../pages/Dashboard";
import Funcionarios from "../pages/Funcionarios";
import CadastrarFuncionario from "../pages/CadastrarFuncionario";
import GerenciaServicos from "../pages/GerenciaServicos";

const ABAS_FINANCEIRO = [
    { rotulo: "Checkout", para: "/app/financeiro/checkout" },
    { rotulo: "Despesas Internas", para: "/app/financeiro/despesas" },
    { rotulo: "Notas Fiscais", para: "/app/financeiro/notas-fiscais" },
    { rotulo: "Estoque", para: "/app/financeiro/estoque" }
];

const ABAS_GESTAO = [
    { rotulo: "Visão Geral", para: "/app/gestao/visao-geral" },
    { rotulo: "Gestão de Funcionários", para: "/app/gestao/funcionarios" },
    { rotulo: "Gerência de Serviços", para: "/app/gestao/servicos" }
];

function AppRoutes() {
    return (
        <Routes>
            {/* Landing Page com login */}
            <Route path="/" element={<LandingPage />} />

            {/* Telas logadas */}
            <Route element={<RotaProtegida />}>
                <Route path="/app" element={<AppShell />}>
                    <Route index element={<Home />} />
                    <Route path="perfil" element={<Perfil />} />
                    <Route path="atendimento" element={<IniciarAtendimento />} />
                    <Route path="ordens-servico" element={<OrdensServico />} />

                    {/* Home > Financeiro e Estoque (abas) */}
                    <Route path="financeiro" element={<SecaoComAbas abas={ABAS_FINANCEIRO} />}>
                        <Route index element={<Navigate to="checkout" replace />} />
                        <Route path="checkout" element={<Checkout />} />
                        <Route path="despesas" element={<Despesas />} />
                        <Route path="notas-fiscais" element={<NotaFiscal />} />
                        <Route path="estoque" element={<Estoque />} />
                    </Route>

                    {/* Home > Dashboards e Gestão (abas) */}
                    <Route path="gestao" element={<SecaoComAbas abas={ABAS_GESTAO} />}>
                        <Route index element={<Navigate to="visao-geral" replace />} />
                        <Route path="visao-geral" element={<Dashboard />} />
                        <Route path="funcionarios" element={<Funcionarios />} />
                        <Route path="funcionarios/novo" element={<CadastrarFuncionario />} />
                        <Route path="servicos" element={<GerenciaServicos />} />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;
