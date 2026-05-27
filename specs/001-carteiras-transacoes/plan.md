# Implementation Plan: Gestão de Carteiras, Contas e Transações

**Branch**: `001-create-feature-branch` | **Date**: 2026-05-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from [spec.md](spec.md)

## Summary

React Finance Platform é uma aplicação web de gestão financeira integrada que permite ao usuário gerenciar até 2 carteiras com contas, cartões e transações (entradas, saídas e transferências). Suporta colaboração segura via convites por email com controle de permissões granulares (leitura, edição, operacional). Cada transação possui status (Efetivada/Pendente), e as transações recorrentes (diárias, semanais, mensais, anuais) aplicam-se apenas a entradas e saídas, nunca a transferências. O saldo é dual: saldo principal (apenas Efetivada) e saldo projetado (Efetivada + Pendente), garantindo precisão monetária e rastreabilidade de todas as operações.

## Technical Context

**Language/Version**: React 19+ com TypeScript strict (5.5+)

**Primary Dependencies**: 
- React Router 7+ (roteamento e navegação)
- TanStack Query v5+ (estado assíncrono e sincronização)
- React Hook Form 7+ + Zod 3+ (formulários e validação)
- decimal.js 10+ (cálculos monetários com precisão)
- MSW 2+ (mock de API e testes)
- Vitest 1+ + React Testing Library (testes)
- Playwright 1.40+ (E2E)

**Storage**: LocalStorage + JSON fixtures versionadas para MVP; integração com backend REST será feita após stabilização da API de contratos

**Testing**: Vitest + React Testing Library (unit/integration), Playwright (end-to-end)

**Target Platform**: Web browser moderno (Chrome 120+, Firefox 121+, Safari 17+, Edge 120+); responsive mobile-first

**Project Type**: Web application (SPA - Single Page Application)

**Performance Goals**: 
- Cálculo de saldos: < 100ms para carteira com até 1000 transações
- Renderização de listas: 60 fps com scroll em históricos de até 500 transações visíveis
- Validação de formulários: resposta instantânea (<50ms) em mudanças de campo

**Constraints**: 
- Máximo 2 carteiras por usuário (regra de negócio rígida)
- Valores monetários sempre com 2 casas decimais (BRL)
- Fusos horários explícitos em todas as datas (ISO-8601 com TZ)
- Auditoria imutável de todas as ações CRUD críticas
- Sem permissão de exclusão de carteira para convidados

**Scale/Scope**: 
- ~15-20 telas principais (wallets, accounts, cards, transactions, collaborators, settings)
- ~40-50 componentes reutilizáveis
- ~30-40 hooks customizados para lógica de negócio
- ~100-150 testes unitários + integração, 10-15 jornadas E2E

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

✅ **Financial integrity gate**: Uso de `decimal.js` para toda operação monetária (somas, subtrações, recálculos). Dois agregadores por carteira: `mainBalance` (Efetivada) e `projectedBalance` (Efetivada + Pendente). Reconciliação determinística com recálculo completo após exclusões hard-delete. Datas em ISO-8601 com TZ explícito.

✅ **React architecture gate**: 
- Server state em TanStack Query (sincronização com MSW/backend)
- Form state em React Hook Form
- Global/UI state em Context (minimal) ou Zustand se necessário
- Validação em fronteiras com schemas Zod compartilhados
- Componentes focados em apresentação, regras de negócio em hooks/services

✅ **Routing contract gate**: 
- Mapa de rotas por carteira: `/wallets/:walletId/...`
- Autenticação simulada em dev (token em localStorage)
- Guards por role (read/edit/operate) centralizados em helpers
- Error boundaries por segmento
- Deep-link e back/forward estável
- 404 tratado explicitamente

✅ **Quality gate**: 
- Unit tests: cálculos de saldo, recálculo pós-exclusão, validações de permissão
- Integration tests: formulários + roteamento + TanStack Query + MSW handlers
- E2E tests: jornadas P1/P2/P3 com dados mockados
- CI gates: typecheck, lint, testes, build obrigatórios antes de merge

✅ **Security/a11y/observability gate**: 
- Dados sensíveis minimizados no cliente; auth via simulação (dev) ou JWT (produção)
- Validação e sanitização de entradas em fronteiras
- WCAG 2.2 AA: navegação por teclado, labels semânticos, contrast ratio
- Telemetria estruturada de ações críticas (criar/editar/deletar transação, convites, alterações de permissão)
- Erro centralizado em logger com stack trace

## Project Structure

### Documentation (this feature)

```
specs/001-carteiras-transacoes/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas: decimal.js, saldo dual, MSW, permissões, roteamento, validação, testes
├── data-model.md        # Entidades: User, Wallet, WalletPermission, Account, Card, Transaction, Refund
├── quickstart.md        # Guia de início rápido para desenvolvimento local
├── spec.md              # Requisitos funcionais, histórias de usuário, edge cases
├── contracts/
│   └── frontend-api.yaml  # Contrato de API: endpoints, payloads, respostas, erros
├── tasks.md             # Tarefas executáveis (será gerado por /speckit.tasks)
└── checklists/
    ├── requirements.md   # Checklist de requisitos
    └── quality.md        # Checklist de qualidade
```

### Source Code (repository root)

```
react-finance-platform/
├── src/
│   ├── components/           # Componentes React reutilizáveis
│   │   ├── common/          # Componentes comuns (Button, Modal, Input, etc.)
│   │   ├── layout/          # Layout (Header, Sidebar, MainContent)
│   │   └── features/        # Componentes específicos por feature
│   │       ├── wallets/
│   │       ├── accounts/
│   │       ├── cards/
│   │       ├── transactions/
│   │       └── collaborators/
│   ├── pages/               # Páginas (1:1 com rotas)
│   │   ├── WalletsPage.tsx
│   │   ├── AccountsPage.tsx
│   │   ├── TransactionsPage.tsx
│   │   └── [...]
│   ├── hooks/               # Hooks customizados
│   │   ├── useWallets.ts
│   │   ├── useAccounts.ts
│   │   ├── useTransactions.ts
│   │   ├── usePermissions.ts
│   │   └── [...]
│   ├── services/            # Lógica de negócio
│   │   ├── balanceCalculator.ts   # Cálculos com decimal.js
│   │   ├── transactionRecalculator.ts
│   │   ├── permissionHelper.ts
│   │   └── [...]
│   ├── schemas/             # Validação com Zod
│   │   ├── transactionSchema.ts
│   │   ├── accountSchema.ts
│   │   └── [...]
│   ├── types/               # TypeScript tipos globais
│   │   └── domain.ts
│   ├── api/                 # Cliente HTTP e handlers MSW
│   │   ├── client.ts
│   │   ├── mocks/
│   │   │   ├── handlers.ts
│   │   │   └── fixtures/
│   │   │       ├── happy-path.json
│   │   │       ├── permission-denied.json
│   │   │       └── [...]
│   │   └── queries.ts
│   ├── router/              # Configuração de rotas
│   │   ├── routes.tsx
│   │   └── guards.ts
│   ├── store/               # Estado global (Context ou Zustand)
│   │   └── authStore.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── unit/                # Testes unitários
│   │   ├── balanceCalculator.test.ts
│   │   ├── permissionHelper.test.ts
│   │   └── [...]
│   ├── integration/         # Testes de integração
│   │   ├── walletFlow.test.ts
│   │   ├── transactionFlow.test.ts
│   │   └── [...]
│   └── e2e/                 # Testes end-to-end (Playwright)
│       ├── userJourney.spec.ts
│       ├── collaborationFlow.spec.ts
│       └── [...]
├── public/                  # Assets estáticos
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

**Structure Decision**: Arquitetura de SPA moderna com separação clara entre componentes de apresentação, hooks customizados, serviços de negócio e schemas de validação. Testes organizados por camada (unit, integration, e2e). Estado assíncrono centralizado em TanStack Query, estado local em React Hook Form, estado global mínimo em Context/Zustand.

## Complexity Tracking

Sem violações à constitution que exijam justificação. Todas as decisões técnicas estão alinhadas aos 5 princípios e à baseline aprovada.
