# Quickstart: Frontend React com Mock de Dados

## Pré-requisitos

- Node.js 20+
- npm 10+

## Setup inicial (quando iniciar implementação)

1. Criar app React + TypeScript strict (Vite).
2. Instalar dependências base:
   - react-router-dom
   - @tanstack/react-query
   - react-hook-form
   - zod
   - msw
   - decimal.js
   - date-fns
   - zustand
3. Configurar lint/typecheck/testes:
   - ESLint + Prettier
   - Vitest + Testing Library
   - Playwright

## Estrutura mínima esperada

- src/app/router
- src/features/{wallets,transactions,accounts,cards,permissions,audit}
- src/services/{api,mock}
- src/schemas
- tests/{unit,integration,e2e}

## Fluxo de execução local

1. Iniciar MSW no bootstrap da aplicação.
2. Carregar sessão mock autenticada.
3. Navegar em rota padrão de carteira (`/wallets/:walletId/dashboard`).
4. Validar jornadas críticas:
   - Cadastro de conta/cartão
   - Entrada, saída e transferência
   - Convite por e-mail e troca de permissão
   - Bloqueios de exclusão e recálculo

## Critérios de pronto para implementação

- Contrato de API mock definido em `contracts/frontend-api.yaml`.
- Data model aprovado em `data-model.md`.
- Estratégia de testes alinhada à constitution.

## Comandos esperados (alvo)

- `npm run dev`
- `npm run test`
- `npm run test:e2e`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
