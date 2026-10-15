-- Guarda qual estratégia de processamento foi escolhida ao criar a ordem.
-- O valor padrão mantém os pedidos existentes e os novos pedidos antigos
-- compatíveis, tratando-os como processamento comum.
ALTER TABLE pedido
    ADD COLUMN tipo_processamento ENUM('comum', 'urgente', 'garantia')
        NOT NULL DEFAULT 'comum'
        AFTER status;

-- Guarda a estratégia de cobrança escolhida para cada serviço da ordem.
-- O padrão de preço fixo preserva o comportamento de ordens já cadastradas.
ALTER TABLE pedido_servico
    ADD COLUMN tipo_cobranca ENUM('preco_fixo', 'hora_tecnica', 'orcamento')
        NOT NULL DEFAULT 'preco_fixo'
        AFTER servico_id;

-- Armazena o valor definido pelo técnico quando a cobrança for por orçamento.
-- NULL significa que ainda não foi informado e o sistema usa o valor do serviço.
ALTER TABLE pedido_servico
    ADD COLUMN valor_orcado DECIMAL(12,2) NULL
        AFTER tipo_cobranca;
