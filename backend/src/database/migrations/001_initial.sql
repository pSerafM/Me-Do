CREATE TABLE IF NOT EXISTS funcionario (
    id_funcionario BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(32) NOT NULL UNIQUE,
    telefone VARCHAR(40) NOT NULL DEFAULT '',
    email VARCHAR(254) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    genero VARCHAR(80) NOT NULL DEFAULT '',
    data_de_nascimento DATE NULL,
    cep VARCHAR(20) NOT NULL DEFAULT '',
    rua VARCHAR(255) NOT NULL DEFAULT '',
    cidade VARCHAR(120) NOT NULL DEFAULT '',
    estado VARCHAR(2) NOT NULL DEFAULT '',
    complemento VARCHAR(255) NOT NULL DEFAULT '',
    status ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
    numero INT UNSIGNED NOT NULL DEFAULT 0,
    criado_em DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cliente (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(32) NOT NULL UNIQUE,
    telefone VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS servico (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    valor DECIMAL(12,2) NOT NULL CHECK (valor >= 0),
    horas_estimadas DECIMAL(8,2) NOT NULL CHECK (horas_estimadas >= 0),
    descricao TEXT NOT NULL,
    status BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS estoque (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    quantidade DECIMAL(12,3) NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
    unidade VARCHAR(40) NOT NULL,
    sku VARCHAR(100) NULL UNIQUE,
    categoria VARCHAR(120) NOT NULL DEFAULT '',
    preco_custo DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (preco_custo >= 0),
    quantidade_minima DECIMAL(12,3) NOT NULL DEFAULT 0 CHECK (quantidade_minima >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedido_insumo (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT UNSIGNED NOT NULL,
    estoque_id BIGINT UNSIGNED NOT NULL,
    quantidade_usada DECIMAL(12,3) NOT NULL CHECK (quantidade_usada > 0),
    valor_unitario DECIMAL(12,2) NOT NULL CHECK (valor_unitario >= 0),
    criado_em DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT pedido_insumo_estoque_fk FOREIGN KEY (estoque_id) REFERENCES estoque(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedido (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cliente_id BIGINT UNSIGNED NOT NULL,
    servico_id BIGINT UNSIGNED NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'aberto',
    etapa ENUM('aberto', 'analise', 'aguardando_insumo', 'manutencao',
        'pronto_retirada', 'retirado', 'cancelado') NOT NULL DEFAULT 'aberto',
    valor_total DECIMAL(12,2) NOT NULL CHECK (valor_total >= 0),
    data_abertura DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    data_previsao DATETIME(3) NOT NULL,
    data_conclusao DATETIME(3) NULL,
    laudo_tecnico TEXT NOT NULL,
    motivo_cancelamento TEXT NOT NULL,
    encerrado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pedido_cliente_fk FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    CONSTRAINT pedido_servico_fk FOREIGN KEY (servico_id) REFERENCES servico(id),
    INDEX pedido_data_idx (data_abertura, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE pedido_insumo
    ADD CONSTRAINT pedido_insumo_pedido_fk
    FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS pedido_servico (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT UNSIGNED NOT NULL,
    servico_id BIGINT UNSIGNED NOT NULL,
    valor_cobrado DECIMAL(12,2) NOT NULL CHECK (valor_cobrado >= 0),
    CONSTRAINT pedido_servico_pedido_fk FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
    CONSTRAINT pedido_servico_servico_fk FOREIGN KEY (servico_id) REFERENCES servico(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedido_item (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    pedido_servico_id BIGINT UNSIGNED NOT NULL,
    modelo VARCHAR(255) NOT NULL DEFAULT '',
    marca VARCHAR(255) NOT NULL DEFAULT '',
    numero_serie VARCHAR(255) NOT NULL DEFAULT '',
    estado VARCHAR(255) NOT NULL DEFAULT '',
    observacao TEXT NOT NULL,
    foto TEXT NOT NULL,
    CONSTRAINT pedido_item_servico_fk FOREIGN KEY (pedido_servico_id) REFERENCES pedido_servico(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `log` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT UNSIGNED NOT NULL,
    funcionario_id BIGINT UNSIGNED NULL,
    funcionario_nome VARCHAR(255) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    data DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT log_pedido_fk FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
    CONSTRAINT log_funcionario_fk FOREIGN KEY (funcionario_id) REFERENCES funcionario(id_funcionario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS checkout (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT UNSIGNED NOT NULL,
    funcionario_id BIGINT UNSIGNED NOT NULL,
    valor_pago DECIMAL(12,2) NOT NULL CHECK (valor_pago > 0),
    forma_pagamento ENUM('pix', 'credito', 'debito', 'dinheiro') NOT NULL,
    data_pagamento DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT checkout_pedido_fk FOREIGN KEY (pedido_id) REFERENCES pedido(id),
    CONSTRAINT checkout_funcionario_fk FOREIGN KEY (funcionario_id) REFERENCES funcionario(id_funcionario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS despesa_interna (
    id_despesa BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(12,2) NOT NULL CHECK (valor > 0),
    data DATE NOT NULL,
    status ENUM('pendente', 'paga') NOT NULL DEFAULT 'pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS nota_fiscal (
    id_nota_fiscal BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT UNSIGNED NOT NULL UNIQUE,
    numero BIGINT UNSIGNED NULL UNIQUE,
    serie VARCHAR(20) NOT NULL,
    data_emissao DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    chave_acesso VARCHAR(255) NOT NULL,
    status ENUM('autorizada', 'em_processamento', 'com_erro', 'cancelada')
        NOT NULL DEFAULT 'em_processamento',
    mensagem_erro TEXT NOT NULL,
    CONSTRAINT nota_fiscal_pedido_fk FOREIGN KEY (pedido_id) REFERENCES pedido(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS estoque_movimentacao (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    estoque_id BIGINT UNSIGNED NOT NULL,
    funcionario_id BIGINT UNSIGNED NULL,
    tipo ENUM('entrada', 'saida', 'ajuste') NOT NULL,
    quantidade DECIMAL(12,3) NOT NULL CHECK (quantidade >= 0),
    observacao TEXT NOT NULL,
    data DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT estoque_movimentacao_estoque_fk FOREIGN KEY (estoque_id) REFERENCES estoque(id),
    CONSTRAINT estoque_movimentacao_funcionario_fk FOREIGN KEY (funcionario_id) REFERENCES funcionario(id_funcionario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
