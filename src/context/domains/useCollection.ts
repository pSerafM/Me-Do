import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../api/client";

export function useCollection<TApi, TModel>(
    path: string,
    authenticated: boolean,
    revive: (value: TApi) => TModel,
    reportError: (message: string) => void
) {
    const [storedItems, setItems] = useState<TModel[]>([]);

    const refresh = useCallback(async () => {
        const rows = await apiRequest<TApi[]>(path);
        const models = rows.map(revive);
        setItems(models);
        return models;
    }, [path, revive]);

    useEffect(() => {
        if (!authenticated) return;
        let current = true;
        apiRequest<TApi[]>(path)
            .then((rows) => {
                if (current) setItems(rows.map(revive));
            })
            .catch((error: unknown) => {
                if (current) {
                    reportError(error instanceof Error ? error.message : "Falha ao carregar dados.");
                }
            });
        return () => {
            current = false;
        };
    }, [authenticated, path, reportError, revive]);

    return { items: authenticated ? storedItems : [], setItems, refresh };
}
