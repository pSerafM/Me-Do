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
   Reexecute esse comando após atualizar o projeto: novas migrações pendentes,
   incluindo `003_order_strategies`, serão aplicadas. Essa migração registra o
   tipo de processamento em `pedido` e o tipo de cobrança/orçamento em
   `pedido_servico`. Funcionários existentes recebem `Atendente` por padrão;
   promova a conta proprietária existente para `Dono` antes de usar a gestão de
   cargos, por exemplo:

   ```sql
   UPDATE funcionario SET cargo = 'Dono' WHERE email = 'email-do-proprietario';
   ```
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
O primeiro funcionário criado por bootstrap ou pela seed recebe o cargo `Dono`.

Os cargos são cumulativos: `Prestador` herda as permissões de `Atendente`,
`Gestor` herda as de `Prestador` e `Dono` herda as de `Gestor`. A API valida
permissões em cada endpoint e somente `Dono` pode atribuir cargos. Checkout,
notas fiscais e cancelamento de pedidos estão disponíveis a todos os cargos.

As operações de pedidos gravam pedido, serviços, insumos, checkout, nota fiscal
e log em transações MySQL. O frontend carrega os dados da API por domínio e
atualiza as coleções após gravações.

## Fluxo de CRUD de pedidos (OS)

O frontend não grava dados no banco diretamente. A tela chama o contexto React,
o hook do domínio envia uma requisição HTTP para o NestJS e o controller grava
no MySQL. Após alterações, o hook recarrega a lista para que todas as telas
recebam o estado persistido do servidor.

### 1. Onde os dados passam

1. **Telas e modais:** `src/pages/IniciarAtendimento.tsx` cria o atendimento;
   `src/pages/OrdensServico.tsx` movimenta/cancela ordens; e
   `src/pages/Checkout.tsx` finaliza a retirada. Os modais de descrição técnica
   e pagamento coletam os dados necessários.
2. **Modelo de domínio:** `src/models/Pedido.ts` representa uma OS e calcula
   itens, total, pagamentos e saldo. `src/models/ItemPedido.ts` associa os dados
   do produto a um serviço e delega o valor ao serviço.
3. **Contrato e composição React:** `src/context/AppContext.ts` tipa as
   operações públicas. `src/context/AppProvider.tsx` compõe os hooks e
   disponibiliza as funções às telas.
4. **Lógica HTTP do domínio:** `src/context/domains/usePedidoDomain.ts`
   transforma ações da tela em chamadas aos endpoints. `src/api/client.ts`
   centraliza URL, JSON, cookie de sessão e erros.
5. **Servidor:** `backend/src/api/api.dto.ts` valida os dados recebidos.
   `backend/src/api/api.controller.ts` verifica regras, permissões e executa
   as consultas/transações.
6. **Banco e retorno:** `backend/src/database/migrations/001_initial.sql`
   define as tabelas e relações. O endpoint `GET /api/pedidos` devolve o
   agregado da OS e `src/api/modelsFromApi.ts`, em `reviverPedido`, converte o
   JSON em objetos e datas que a interface usa.

### 2. Criar e consultar

Ao gerar a OS, `IniciarAtendimento.gerarOS()` monta um `Pedido` com o cliente,
os serviços e detalhes dos produtos. O domínio envia `POST /api/pedidos` com
IDs, a modalidade de cobrança escolhida por serviço e o tipo de processamento;
não confia no ID ou no total temporário do navegador. O DTO
`CriarPedidoDto` valida o corpo. `ApiController.criarPedido()` confirma que
cliente e serviços existem e estão ativos, calcula o total/prazo no servidor e,
em uma só transação, grava:

- `pedido`: cliente, serviço principal, estratégia de processamento, status,
  etapa e totais;
- `pedido_servico`: cada serviço associado à ordem, sua estratégia de cobrança
  e o valor atualmente cobrado;
- `pedido_item`: modelo, marca, série, condição, observação e foto de cada item;
- `log`: evento de abertura, incluindo funcionário e horário.

O servidor devolve o ID gerado pelo MySQL. O hook chama `refresh()`, que faz
`GET /api/pedidos`; `reviverPedido()` reconstrói o objeto completo, e a tela
exibe a OS persistida. A consulta também carrega `pedido_insumo`, `checkout` e
`log` para o histórico e o cálculo do saldo.

### 3. Atualizar durante o reparo

- **Etapa do Kanban:** `OrdensServico` chama `moverEtapa()` no hook; este envia
  `PATCH /api/pedidos/:id/etapa`. O controller bloqueia a linha, valida a
  transição e o laudo necessário, atualiza `pedido.etapa` e inclui um `log`.
- **Laudo e progresso:** `DescricaoTecnicaModal` chama
  `salvarDescricaoTecnica()`; o hook envia `POST /api/pedidos/:id/laudo`.
  Numa transação, o controller baixa cada quantidade em `estoque`, registra o
  consumo em `pedido_insumo`, atualiza laudo/etapa e grava o histórico. Para
  serviços com cobrança por orçamento, o técnico também pode informar ou
  limpar o valor nessa tela. O total é recalculado no servidor; a alteração é
  recusada se deixar o total abaixo do que já foi pago.
- **Cancelamento:** a tela/modal recolhe o motivo e envia
  `POST /api/pedidos/:id/cancelamento`. O servidor atualiza a etapa e
  `motivo_cancelamento` em `pedido` e grava o evento no `log`. Não há exclusão
  física do pedido: cancelar é a forma de encerrá-lo sem apagar seu histórico.

Após cada operação bem-sucedida, o hook recarrega `GET /api/pedidos`; após
salvar insumos, também atualiza o domínio do estoque.

### 4. Pagamentos e retirada

O modal de pagamento entrega valor e forma escolhidos ao chamador:

- **Entrada/parcial:** `registrarPagamento()` envia
  `POST /api/pedidos/:id/pagamentos`. O servidor bloqueia o pedido, calcula o
  saldo com os lançamentos existentes, rejeita excesso e insere uma linha em
  `checkout` e outra no `log`.
- **Pagamento na retirada:** `Checkout` chama `finalizarPedido()`, que envia
  `POST /api/pedidos/:id/finalizacao`. O servidor recebe o saldo restante, se
  houver, grava seu pagamento, marca o pedido como retirado/encerrado,
  registra o log e cria a nota em `nota_fiscal`, tudo na mesma transação.
  Pedido cancelado pode ser encerrado no checkout, mas não marcado como retirado.

O hook recarrega pedidos e notas fiscais depois da finalização. O saldo mostrado
na interface é `Pedido.saldo()`: total da OS menos a soma dos pagamentos em
`Pedido.pagamentos`.

### 5. Como ler ou depurar o fluxo

Para acompanhar uma ação, comece pelo `onClick`/`onSubmit` da tela, siga o nome
da função no `AppContext`, localize sua implementação em
`usePedidoDomain.ts`, confirme a URL HTTP em `apiRequest()` e então procure a
rota correspondente no `ApiController`. Por fim, confira as tabelas usadas na
transação da migração. Erros de validação e regra retornam ao hook, que os
converte em mensagem para a tela; falha numa transação reverte as gravações
daquela operação.

### Estratégias operacionais

Na criação da OS, a tabela de serviços permite escolher preço fixo, hora
técnica ou orçamento por linha. O preço fixo usa o valor cadastrado; hora
técnica multiplica esse valor pelas horas estimadas; orçamento começa com o
valor cadastrado e pode ser ajustado pelo técnico no laudo. O servidor repete
os cálculos e grava a modalidade em `pedido_servico`, para que o total oficial
não dependa do navegador.

Também na criação, o atendente escolhe processamento comum, urgente ou
garantia. `usePedidoDomain` chama `ProcessarPedido` com a estratégia escolhida;
o servidor persiste o tipo em `pedido.tipo_processamento` e o status
correspondente (`aprovado`, `urgente` ou `garantia`). Esse status de
processamento é diferente da etapa operacional do Kanban (`aberto`,
`manutencao`, etc.).
