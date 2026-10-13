const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/+$/, "");

export class ApiError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    });

    if (!response.ok) {
        let message = `Erro da API (${response.status}).`;
        try {
            const body: unknown = await response.json();
            if (typeof body === "object" && body !== null && "message" in body) {
                const apiMessage = body.message;
                message = Array.isArray(apiMessage)
                    ? apiMessage.join(" ")
                    : String(apiMessage);
            }
        } catch {
            // A resposta sem JSON mantém a mensagem HTTP explícita.
        }
        throw new ApiError(message, response.status);
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
}

export function apiBody(body: unknown): string {
    return JSON.stringify(body);
}

export function apiErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Falha inesperada ao comunicar com a API.";
}
