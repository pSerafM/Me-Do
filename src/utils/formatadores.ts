export function moeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

export function dataBR(data: Date): string {
    return data.toLocaleDateString("pt-BR");
}

export function dataHoraBR(data: Date): string {
    return `${data.toLocaleDateString("pt-BR")} ${data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    })}`;
}

// "yyyy-mm-dd" usado pelos <input type="date"> (sem deslocar o fuso).
export function paraInputData(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

export function deInputData(valor: string): Date {
    return new Date(`${valor}T00:00:00`);
}

export function somenteDigitos(valor: string): string {
    return valor.replace(/\D/g, "");
}

// Tag de prazo restante dos cards do Kanban.
export function prazoRestante(previsao: Date): { texto: string; atrasado: boolean } {
    const diferenca = previsao.getTime() - new Date().getTime();
    const horasTotais = Math.floor(Math.abs(diferenca) / 3_600_000);
    const dias = Math.floor(horasTotais / 24);
    const horas = horasTotais % 24;
    const formatado = dias > 0 ? `${dias}d ${horas}h` : `${horas}h`;

    if (diferenca < 0) {
        return { texto: `Atrasado ${formatado}`, atrasado: true };
    }

    return { texto: `${formatado} restantes`, atrasado: false };
}
