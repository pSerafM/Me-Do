import type { Pedido } from "../models/Pedido";

// Contrato do Strategy: cada processador recebe a OS e aplica seu comportamento específico.
export interface EstrategiaProcessamentoPedido {
    // Tipo enviado à API e salvo para reconstruir a escolha feita na criação.
    readonly tipo: TipoProcessamentoPedido;
    // A estratégia modifica o pedido sem obrigar o contexto a conhecer a regra concreta.
    aplicar(pedido: Pedido): void;
}

// Opções oferecidas na tela e aceitas pelo backend.
export type TipoProcessamentoPedido = "comum" | "urgente" | "garantia";
