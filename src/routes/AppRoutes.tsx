import { Navigate, Route, Routes } from "react-router-dom";
import RotaProtegida from "./RotaProtegida";
import RotaComPermissao from "./RotaComPermissao";
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
import { PERMISSOES, temPermissao } from "../auth/permissions";
import { useApp } from "../hooks/useApp";

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
    const { usuario } = useApp();
    const cargo = usuario?.cargo;
    const abasFinanceiro = ABAS_FINANCEIRO.filter((aba) => {
        if (aba.para.endsWith("/despesas")) {
            return cargo && temPermissao(cargo, PERMISSOES.despesasGerenciar);
        }
        if (aba.para.endsWith("/estoque")) {
            return cargo && temPermissao(cargo, PERMISSOES.estoqueGerenciar);
        }
        return true;
    });
    const abasGestao = ABAS_GESTAO.filter((aba) => {
        if (aba.para.endsWith("/visao-geral")) {
            return cargo && temPermissao(cargo, PERMISSOES.visaoFinanceira);
        }
        if (aba.para.endsWith("/funcionarios")) {
            return cargo && temPermissao(cargo, PERMISSOES.funcionariosGerenciar);
        }
        return cargo && temPermissao(cargo, PERMISSOES.servicosGerenciar);
    });

    return (
        <Routes>
            {/* Landing Page com login */}
            <Route path="/" element={<LandingPage />} />

            {/* Telas logadas */}
            <Route element={<RotaProtegida />}>
                <Route path="/app" element={<AppShell />}>
                    <Route index element={<Home />} />
                    <Route path="perfil" element={<Perfil />} />
                    <Route element={<RotaComPermissao permissao={PERMISSOES.pedidosCriar} />}>
                        <Route path="atendimento" element={<IniciarAtendimento />} />
                    </Route>
                    <Route element={<RotaComPermissao permissao={PERMISSOES.pedidosConsultar} />}>
                        <Route path="ordens-servico" element={<OrdensServico />} />
                    </Route>

                    {/* Home > Financeiro e Estoque (abas) */}
                    <Route element={<RotaComPermissao permissao={PERMISSOES.checkout} />}>
                        <Route path="financeiro" element={<SecaoComAbas abas={abasFinanceiro} />}>
                            <Route index element={<Navigate to="checkout" replace />} />
                            <Route path="checkout" element={<Checkout />} />
                            <Route path="notas-fiscais" element={<NotaFiscal />} />
                            <Route element={<RotaComPermissao permissao={PERMISSOES.despesasGerenciar} />}>
                                <Route path="despesas" element={<Despesas />} />
                            </Route>
                            <Route element={<RotaComPermissao permissao={PERMISSOES.estoqueGerenciar} />}>
                                <Route path="estoque" element={<Estoque />} />
                            </Route>
                        </Route>
                    </Route>

                    {/* Home > Dashboards e Gestão (abas) */}
                    <Route element={<RotaComPermissao permissao={PERMISSOES.funcionariosGerenciar} />}>
                        <Route path="gestao" element={<SecaoComAbas abas={abasGestao} />}>
                            <Route
                                index
                                element={
                                    <Navigate
                                        to={cargo === "Dono" ? "visao-geral" : "funcionarios"}
                                        replace
                                    />
                                }
                            />
                            <Route element={<RotaComPermissao permissao={PERMISSOES.visaoFinanceira} />}>
                                <Route path="visao-geral" element={<Dashboard />} />
                            </Route>
                            <Route element={<RotaComPermissao permissao={PERMISSOES.funcionariosGerenciar} />}>
                                <Route path="funcionarios" element={<Funcionarios />} />
                                <Route path="funcionarios/novo" element={<CadastrarFuncionario />} />
                            </Route>
                            <Route element={<RotaComPermissao permissao={PERMISSOES.servicosGerenciar} />}>
                                <Route path="servicos" element={<GerenciaServicos />} />
                            </Route>
                        </Route>
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;
