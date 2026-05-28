# React Finance Platform

Frontend de uma plataforma financeira construida com React + TypeScript + Vite, orientada por Spec Kit.

O projeto cobre fluxos de carteiras, contas, cartoes, transacoes, despesas, permissao, auditoria e observabilidade, com validacao de regras de negocio e suite de testes para jornadas criticas.

## Objetivo

Entregar uma SPA financeira com:

- precisao monetaria com decimal-safe arithmetic
- validacao de formularios com schema
- regras de transferencia, recorrencia e duplicidade
- protecao de acesso por carteira e permissao
- trilhas separadas para auditoria e observabilidade

## Stack

- React 19
- TypeScript strict
- Vite
- React Router
- TanStack Query
- React Hook Form + Zod
- MSW para mock de API
- Vitest + Testing Library
- ESLint + Prettier

## Requisitos

- Node.js 20+
- npm 10+

## Como iniciar

1. Instale as dependencias:

```bash
npm install
```

2. Rode o projeto local:

```bash
npm run dev
```

3. Abra no navegador:

http://127.0.0.1:5173

Observacao: o mock de API (MSW) e iniciado no bootstrap da aplicacao.

## Scripts

```bash
npm run dev         # inicia ambiente local
npm run build       # build de producao
npm run preview     # preview do build
npm run lint        # lint com fail em warning
npm run lint:fix    # corrige problemas de lint automaticamente
npm run typecheck   # validacao de tipos TS
npm run test        # roda testes uma vez
npm run test:watch  # roda testes em watch
```

## Rotas atuais

Rotas hoje disponíveis na aplicação:

- /: redireciona para /wallets/wallet-001/dashboard
- /wallets/:walletId/dashboard: dashboard principal da carteira
- /wallets/:walletId/transactions: tela base de transações
- /wallets/:walletId/accounts: tela base de contas
- /wallets/:walletId/cards: tela base de cartões
- /wallets/:walletId/permissions: tela base de permissões
- /wallet-not-found: fallback para carteira inexistente
- /unauthorized: fallback para acesso sem permissão
- /login: placeholder de autenticação

Exemplos de acesso local:

- http://127.0.0.1:5173/
- http://127.0.0.1:5173/wallets/wallet-001/dashboard
- http://127.0.0.1:5173/wallets/wallet-001/transactions

Observacao: algumas rotas ainda estão em modo placeholder enquanto as próximas phases não são concluídas.

## Estrutura principal

- [src/main.tsx](src/main.tsx): entrada da aplicacao
- [src/app/providers/AppProviders.tsx](src/app/providers/AppProviders.tsx): providers globais
- [src/app/router/routes.tsx](src/app/router/routes.tsx): mapa de rotas
- [src/services/mock/handlers.ts](src/services/mock/handlers.ts): handlers MSW
- [src/features](src/features): modulos por dominio
- [src/schemas](src/schemas): schemas de validacao
- [tests](tests): testes unitarios e de integracao

## Atualizacoes recentes (2026-05-28)

Progresso iniciado da Phase 4 (US2 - contas e cartoes), com tarefas de teste e base de servicos ja implementadas:

- T046-T051 concluidas em [specs/001-carteiras-transacoes/tasks.md](specs/001-carteiras-transacoes/tasks.md)
- regras de limite de carteiras e estado ativo-inativo em [src/features/wallets/walletService.ts](src/features/wallets/walletService.ts)
- recalc apos hard-delete em [src/features/transactions/hardDeleteRecalculation.ts](src/features/transactions/hardDeleteRecalculation.ts)
- regras de estorno parcial-total em [src/features/cards/refundRules.ts](src/features/cards/refundRules.ts)
- componentes iniciais de contas e cartoes em [src/features/accounts/components](src/features/accounts/components) e [src/features/cards/components](src/features/cards/components)
- servicos iniciais de contas e cartoes em [src/features/accounts/accountService.ts](src/features/accounts/accountService.ts), [src/features/cards/cardService.ts](src/features/cards/cardService.ts) e [src/features/cards/cardDetailService.ts](src/features/cards/cardDetailService.ts)
- cobertura inicial de integracao US2 em [tests/integration/accounts-cards](tests/integration/accounts-cards)

Teste agregado validado para esse lote:

```bash
npm run test -- tests/unit/wallets/walletRules.test.ts tests/unit/accounts-cards/hardDeleteRecalculation.test.ts tests/unit/cards/refundRules.test.ts tests/integration/accounts-cards/formsValidation.test.tsx tests/integration/accounts-cards/listStates.test.tsx tests/integration/accounts-cards/lifecycleFlow.test.tsx
```

## Fluxo recomendado de desenvolvimento

1. Iniciar com npm run dev
2. Implementar em slices pequenos por feature
3. Validar com npm run test
4. Garantir qualidade com npm run typecheck e npm run lint
5. Antes de merge, validar build com npm run build

## Como executar os testes

Rodar toda a suíte:

```bash
npm run test
```

Rodar em modo watch:

```bash
npm run test:watch
```

Rodar um arquivo específico:

```bash
npm run test -- tests/integration/transactions/dashboardStates.test.tsx
```

Rodar vários arquivos específicos:

```bash
npm run test -- tests/integration/transactions/dashboardStates.test.tsx tests/integration/transactions/transactionHappyPath.test.tsx
```

Fluxo recomendado antes de subir mudanças:

```bash
npm run test
npm run typecheck
npm run lint
```

## Documentacao da feature ativa

- [specs/001-carteiras-transacoes/spec.md](specs/001-carteiras-transacoes/spec.md)
- [specs/001-carteiras-transacoes/plan.md](specs/001-carteiras-transacoes/plan.md)
- [specs/001-carteiras-transacoes/research.md](specs/001-carteiras-transacoes/research.md)
- [specs/001-carteiras-transacoes/data-model.md](specs/001-carteiras-transacoes/data-model.md)
- [specs/001-carteiras-transacoes/quickstart.md](specs/001-carteiras-transacoes/quickstart.md)
- [specs/001-carteiras-transacoes/tasks.md](specs/001-carteiras-transacoes/tasks.md)

## Troubleshooting rapido

- Se o lint falhar por warnings, corrija os warnings ou rode npm run lint:fix.
- Se testes de integracao falharem por estado compartilhado, execute o arquivo isolado primeiro.
- Se houver divergencia de contrato de API, revise handlers em [src/services/mock/handlers.ts](src/services/mock/handlers.ts) e schemas em [src/schemas](src/schemas).
