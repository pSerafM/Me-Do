# Changelog

## 1.0.0 — 2026-10-15

- Release dos builds de produção do frontend Vite e da API NestJS.
- Organização por domínios e componentes reutilizáveis no frontend.
- Strategies para cobrança de serviços, processamento de pedidos, pagamentos,
  documentos fiscais e movimentações de estoque.

### Medição de tamanho

O “antes” mede o projeto em desenvolvimento, sem `node_modules`, pastas `dist`,
arquivos de lock ou arquivos TypeScript gerados. As linhas contam arquivos de
código e SQL: `src/` no frontend e `backend/src/` + `backend/scripts/` na API.
O “depois” mede os artefatos produzidos em 2026-10-15.

| Pacote | Antes: pasta fonte | Antes: linhas | Depois: build de produção |
| --- | ---: | ---: | ---: |
| Frontend | 302,136 bytes | 6,776 | `dist/`: 369,265 bytes, 5 arquivos |
| API NestJS | 97,587 bytes | 2,596 | `backend/dist/`: 165,032 bytes, 66 arquivos |

O bundle JavaScript do frontend tem 341.12 kB e 102.18 kB com gzip; o CSS tem
13.12 kB e 3.46 kB com gzip. O HTML tem 0.45 kB e 0.29 kB com gzip. O ZIP de
release, incluindo ambos os builds, manifests de runtime e instruções, tem
216,199 bytes. O Vite minifica e remove código não utilizado do frontend; o
build NestJS compila a API para JavaScript, mantendo os módulos necessários
para execução no Node.js.
