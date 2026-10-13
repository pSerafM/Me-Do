# Me-Do
Simplifique seus reparos. Fidelize seus clientes.

## API NestJS + MySQL (Aiven)

O frontend Vite e o backend NestJS são pacotes independentes neste repositório.
Cada um mantém seu próprio `package-lock.json` e `node_modules`; isso é normal
e isola as dependências. Os comandos abaixo instalam e executam cada pacote.

1. Configure o `.env` local usando `.env.example` como referência. Preserve as
   credenciais existentes e acrescente `JWT_SECRET` (mínimo de 32 caracteres),
   `BOOTSTRAP_TOKEN` aleatório, `DB_SSL=true`, `CORS_ORIGIN` e
   `VITE_API_URL=http://localhost:3000/api`. Nunca coloque segredos em variáveis
   `VITE_*`. Se o Aiven exigir CA próprio, defina `DB_SSL_CA` com o caminho do
   certificado baixado do painel do serviço.
2. Instale as dependências do frontend e do backend: `npm install` e
   `npm install --prefix backend`.
3. Aplique o schema MySQL, sem criar registros iniciais:
   `npm run migrate --prefix backend`.
   A migração cria as tabelas nesta sequência: `funcionario`; `cliente` e
   `servico`; `estoque` e `pedido_insumo`; `pedido`, `pedido_servico` e `log`;
   por fim `checkout`, `despesa_interna` e `nota_fiscal`. A tabela
   `schema_migrations` registra a versão aplicada.
4. Inicie a API com `npm run dev:api` e o frontend em outro terminal com
   `npm run dev`.
5. Como não há seed, crie o primeiro funcionário administrador uma única vez
   enviando um `POST` para `http://localhost:3000/api/auth/bootstrap` com
   `Content-Type: application/json`. O endpoint exige `BOOTSTRAP_TOKEN`, senha
   com pelo menos 12 caracteres e recusa novos cadastros de bootstrap assim
   que existir um funcionário. Exemplo de corpo:

   ```json
   {
     "token": "valor-configurado-em-BOOTSTRAP_TOKEN",
     "nome": "Administrador",
     "cpf": "12345678900",
     "email": "admin@example.com",
     "senha": "uma-senha-longa-e-unica"
   }
   ```

   A senha é armazenada com bcrypt. Login e sessão usam JWT em cookie
   `HttpOnly`; o token não é persistido no navegador por JavaScript.

Se preferir criar esse funcionário por script, configure `SEED_USER_NAME`,
`SEED_USER_CPF`, `SEED_USER_EMAIL` e `SEED_USER_PASSWORD` no `.env` e execute:

```bash
npm run seed:user --prefix backend
```

O comando conecta ao MySQL, grava a senha com bcrypt e só cria esse funcionário
se a tabela estiver vazia. Defina uma senha forte e não compartilhe o `.env`.
Para inserir outros usuários depois, use a tela de funcionários após fazer login.

As operações de pedidos gravam pedido, serviços, insumos, checkout, nota fiscal
e log em transações MySQL. O frontend carrega os dados da API por domínio e
atualiza as coleções após gravações.
