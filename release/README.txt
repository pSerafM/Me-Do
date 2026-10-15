Me-Do 1.0.0 — pacote de produção

Conteúdo
- dist/: frontend compilado pelo Vite. Publique esta pasta em um servidor de
  arquivos estáticos.
- backend/dist/: API NestJS compilada.
- backend/package.json e backend/package-lock.json: dependências de runtime.

Executar a API
1. Entre na pasta backend e instale as dependências de produção:
   npm ci --omit=dev
2. Crie backend/.env com as configurações da aplicação. Não distribua segredos.
   Configure DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET,
   BOOTSTRAP_TOKEN, DB_SSL e CORS_ORIGIN. JWT_SECRET deve ter pelo menos
   32 caracteres.
3. Aplique previamente as migrações no banco usando o projeto-fonte e confirme
   que schema_migrations contém todas as versões esperadas.
4. Inicie a API:
   npm run start:prod

O frontend precisa ser construído com VITE_API_URL apontando para a URL pública
da API. Essa variável é incorporada ao frontend durante o build; não inclua
segredos em variáveis VITE_*.

Este pacote não contém .env, dados de clientes, senhas, certificados ou seed.
