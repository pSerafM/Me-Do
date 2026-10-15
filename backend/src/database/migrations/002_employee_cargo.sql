ALTER TABLE funcionario
    ADD COLUMN cargo ENUM('Atendente', 'Prestador', 'Gestor', 'Dono')
        NOT NULL DEFAULT 'Atendente'
        AFTER email;
