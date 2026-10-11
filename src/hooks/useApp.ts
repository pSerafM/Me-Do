import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export function useApp() {
    const contexto = useContext(AppContext);

    if (!contexto) {
        throw new Error("useApp deve ser usado dentro de <AppProvider>.");
    }

    return contexto;
}
