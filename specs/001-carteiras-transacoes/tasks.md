# Tasks: Gestão de Carteiras, Contas e Transações

**Input**: Documentos de design em `specs/001-carteiras-transacoes/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/frontend-api.yaml`

**Tests**: Incluídos porque a spec exige cenários de teste por história e a constitution define gate de qualidade com unit/integration/e2e.

**Organization**: Tarefas agrupadas por história de usuário para implementação e validação independente.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar o projeto frontend React com toolchain e testes.

- [ ] T001 Inicializar projeto React + TypeScript strict em package.json
- [ ] T002 Configurar TypeScript e Vite em tsconfig.json e vite.config.ts
- [ ] T003 [P] Configurar ESLint e Prettier em eslint.config.js e .prettierrc
- [ ] T004 [P] Configurar Vitest + Testing Library em vitest.config.ts e tests/setup.ts
- [ ] T005 [P] Configurar Playwright em playwright.config.ts e tests/e2e/.gitkeep

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Base técnica obrigatória para qualquer história.

**⚠️ CRITICAL**: Nenhuma história começa antes do fim desta fase.

- [ ] T006 Implementar provedores globais (QueryClient, Router, ErrorBoundary) em src/app/providers/AppProviders.tsx
- [ ] T007 [P] Definir mapa de rotas, guards e fallback 404 em src/app/router/index.tsx
- [ ] T008 [P] Implementar sessão mock e estado de autenticação em src/store/session-store.ts
- [ ] T009 [P] Implementar utilitários de dinheiro e datas com precisão decimal em src/utils/money.ts e src/utils/date.ts
- [ ] T010 [P] Criar schemas Zod compartilhados de domínio em src/schemas/wallet.schemas.ts e src/schemas/transaction.schemas.ts
- [ ] T011 Implementar cliente HTTP e bootstrap do MSW em src/services/api/client.ts e src/services/mock/browser.ts
- [ ] T012 [P] Criar fixtures mock base em src/services/mock/fixtures/wallets.json e src/services/mock/fixtures/transactions.json
- [ ] T013 [P] Implementar handlers mock de contratos em src/services/mock/handlers.ts
- [ ] T014 Implementar serviço de auditoria e telemetria estruturada em src/features/audit/audit-service.ts e src/utils/telemetry.ts
- [ ] T015 [P] Construir shell base com seletor de carteira em src/components/layout/AppShell.tsx e src/components/navigation/WalletSwitcher.tsx

**Checkpoint**: Fundação pronta para iniciar US1/US2/US3.

---

## Phase 3: User Story 1 - Operar uma carteira financeira (Priority: P1) 🎯 MVP

**Goal**: Registrar entradas, saídas e transferências com impacto correto em saldo principal/projetado.

**Independent Test**: Criar carteira com contas, registrar transações de tipos diferentes e validar histórico, status e regra de período.

### Tests for User Story 1

- [ ] T016 [P] [US1] Criar testes de contrato de transações em tests/contract/transactions.contract.spec.ts
- [ ] T017 [P] [US1] Criar teste de integração do formulário de transação em tests/integration/transaction-form.spec.tsx
- [ ] T018 [P] [US1] Criar teste e2e de operação financeira da carteira em tests/e2e/us1-wallet-operations.spec.ts

### Implementation for User Story 1

- [ ] T019 [P] [US1] Implementar queries e mutations de transações em src/features/transactions/transaction-queries.ts
- [ ] T020 [P] [US1] Implementar schema e mapper do formulário de transação em src/features/transactions/transaction-form.schema.ts
- [ ] T021 [US1] Implementar regras de domínio de transação e transferência em src/features/transactions/transaction-service.ts
- [ ] T022 [US1] Construir formulário de nova transação com regra de período condicional em src/features/transactions/components/TransactionForm.tsx
- [ ] T023 [US1] Implementar dashboard com saldo principal/projetado e histórico em src/pages/wallets/WalletDashboardPage.tsx
- [ ] T024 [US1] Implementar processamento de mudança de status pendente/efetivada em src/features/transactions/status-update-service.ts
- [ ] T025 [US1] Bloquear transferência para mesma conta e recorrência indevida em src/features/transactions/transaction-validation.ts

**Checkpoint**: US1 funcional e testável de forma independente.

---

## Phase 4: User Story 2 - Estruturar contas, cartões e limite de carteiras (Priority: P2)

**Goal**: Gerenciar carteiras (limite 2), contas e cartões com arquivamento, exclusão e recálculo.

**Independent Test**: Executar CRUD de contas/cartões, bloquear terceira carteira e validar regras de exclusão/recalculo.

### Tests for User Story 2

- [ ] T026 [P] [US2] Criar testes de contrato de carteiras/contas/cartões em tests/contract/wallet-account-card.contract.spec.ts
- [ ] T027 [P] [US2] Criar teste de integração de arquivamento e filtros operacionais em tests/integration/account-card-archive.spec.tsx
- [ ] T028 [P] [US2] Criar teste de integração de bloqueio de exclusão de conta com cartão vinculado em tests/integration/account-delete-guard.spec.tsx
- [ ] T029 [P] [US2] Criar teste e2e de limite de carteiras e recálculo pós-exclusão em tests/e2e/us2-wallet-account-card.spec.ts

### Implementation for User Story 2

- [ ] T030 [P] [US2] Implementar CRUD de carteiras com bloqueio de terceira carteira em src/features/wallets/wallet-service.ts
- [ ] T031 [P] [US2] Implementar CRUD e status ativo/inativo de contas em src/features/accounts/account-service.ts
- [ ] T032 [P] [US2] Implementar CRUD de cartões e vínculo de conta de débito em src/features/cards/card-service.ts
- [ ] T033 [US2] Implementar páginas de contas e cartões com abas operacionais/configurações em src/pages/accounts/AccountsPage.tsx e src/pages/cards/CardsPage.tsx
- [ ] T034 [US2] Bloquear uso de contas/cartões inativos em novos lançamentos em src/features/transactions/account-card-availability.ts
- [ ] T035 [US2] Implementar bloqueio e mensagem orientativa ao excluir conta com cartão vinculado em src/features/accounts/account-delete-guard.ts
- [ ] T036 [US2] Implementar exclusão definitiva de conta com remoção de transações e recálculo por carteira em src/features/accounts/account-hard-delete-service.ts
- [ ] T037 [US2] Implementar exclusão definitiva de cartão com remoção de despesas/estornos e recálculo em src/features/cards/card-hard-delete-service.ts
- [ ] T038 [US2] Implementar estorno parcial/total com limite estornável em src/features/cards/refund-service.ts

**Checkpoint**: US2 funcional e testável de forma independente.

---

## Phase 5: User Story 3 - Compartilhar carteira com outro usuário por e-mail (Priority: P3)

**Goal**: Convidar colaboradores por e-mail e aplicar matriz de permissões por carteira.

**Independent Test**: Convidar usuário, alterar permissão e validar restrições por perfil sem permitir exclusão de carteira.

### Tests for User Story 3

- [ ] T039 [P] [US3] Criar testes de contrato de permissões e convites em tests/contract/permissions.contract.spec.ts
- [ ] T040 [P] [US3] Criar teste de integração da matriz de permissões na UI em tests/integration/permissions-matrix.spec.tsx
- [ ] T041 [P] [US3] Criar teste e2e de convite e alteração de permissão em tests/e2e/us3-collaboration-permissions.spec.ts

### Implementation for User Story 3

- [ ] T042 [P] [US3] Implementar serviço de convites e upsert de permissão por e-mail em src/features/permissions/permission-service.ts
- [ ] T043 [P] [US3] Implementar guardas de autorização por ação em src/features/permissions/permission-guards.ts
- [ ] T044 [US3] Construir página de colaboradores com gestão de permissões em src/pages/collaborators/CollaboratorsPage.tsx
- [ ] T045 [US3] Aplicar restrição estrutural para impedir exclusão de carteira por convidados em src/features/wallets/wallet-ownership-guard.ts
- [ ] T046 [US3] Implementar atualização imediata de permissões em sessão ativa em src/features/permissions/permission-sync.ts

**Checkpoint**: US3 funcional e testável de forma independente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes finais de qualidade, acessibilidade e observabilidade.

- [ ] T047 [P] Consolidar testes unitários de regras financeiras e permissão em tests/unit/financial-rules.spec.ts e tests/unit/permission-rules.spec.ts
- [ ] T048 [P] Executar auditoria de acessibilidade (teclado, labels, foco) em src/components/accessibility/a11y-audit-notes.md
- [ ] T049 Otimizar performance de listagem principal e memoização de filtros em src/features/transactions/transaction-list-performance.ts
- [ ] T050 Validar e completar eventos de telemetria/auditoria nas jornadas críticas em src/features/audit/audit-event-map.ts
- [ ] T051 Validar fluxo completo do quickstart e atualizar instruções finais em specs/001-carteiras-transacoes/quickstart.md
- [ ] T052 [P] Configurar pipeline de CI com jobs de typecheck, lint, testes (unit+integration) e build em .github/workflows/ci.yml — gate obrigatório de merge exigido pela constitution
- [ ] T053 [P] Criar testes unit/integration de imutabilidade de logs de auditoria pós hard-delete de conta e de cartão em tests/unit/audit-immutability.spec.ts e tests/integration/audit-log-hard-delete.spec.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): inicia imediatamente.
- Foundational (Phase 2): depende da conclusão do Setup e bloqueia todas as histórias.
- User Stories (Phase 3-5): dependem da conclusão da Foundational.
- Polish (Phase 6): depende da conclusão das histórias selecionadas.
- T052 (CI): pode ser configurado em paralelo com Phase 1 sem bloquear histórias; deve estar funcional antes do merge.
- T053 (audit-immutability): depende de T014 (audit-service) e T036/T037 (hard-delete); pode rodar em paralelo com T047.

### User Story Dependencies

- US1 (P1): começa após Phase 2; é o MVP.
- US2 (P2): começa após Phase 2; integra com base de US1 sem bloquear validação independente.
- US3 (P3): começa após Phase 2; depende de rotas/guards/fundações, mas valida independente.

### Within Each User Story

- Testes de contrato/integration/e2e devem ser criados antes da implementação e falhar inicialmente.
- Queries/schemas antes de serviços.
- Serviços antes de páginas/componentes de integração.
- Regras de domínio e bloqueios antes de refinamentos de UX.

### Parallel Opportunities

- Phase 1: T003, T004 e T005 em paralelo.
- Phase 2: T007, T008, T009, T010, T012, T013 e T015 em paralelo.
- US1: T016, T017, T018, T019 e T020 em paralelo.
- US2: T026, T027, T028, T029, T030, T031 e T032 em paralelo.
- US3: T039, T040, T041, T042 e T043 em paralelo.

---

## Parallel Example: User Story 1

```bash
# Testes paralelos da US1
T016 tests/contract/transactions.contract.spec.ts
T017 tests/integration/transaction-form.spec.tsx
T018 tests/e2e/us1-wallet-operations.spec.ts

# Implementação paralela da US1
T019 src/features/transactions/transaction-queries.ts
T020 src/features/transactions/transaction-form.schema.ts
```

## Parallel Example: User Story 2

```bash
# Testes paralelos da US2
T026 tests/contract/wallet-account-card.contract.spec.ts
T027 tests/integration/account-card-archive.spec.tsx
T028 tests/integration/account-delete-guard.spec.tsx
T029 tests/e2e/us2-wallet-account-card.spec.ts

# Implementação paralela da US2
T030 src/features/wallets/wallet-service.ts
T031 src/features/accounts/account-service.ts
T032 src/features/cards/card-service.ts
```

## Parallel Example: User Story 3

```bash
# Testes paralelos da US3
T039 tests/contract/permissions.contract.spec.ts
T040 tests/integration/permissions-matrix.spec.tsx
T041 tests/e2e/us3-collaboration-permissions.spec.ts

# Implementação paralela da US3
T042 src/features/permissions/permission-service.ts
T043 src/features/permissions/permission-guards.ts
```

---

## Implementation Strategy

### MVP First (US1)

1. Completar Phase 1 e Phase 2.
2. Entregar US1 (Phase 3) com validação e2e.
3. Validar critérios de saldo principal/projetado e regras de transferência.
4. Demonstrar MVP.

### Incremental Delivery

1. Foundation pronta (Phase 1 + Phase 2).
2. Entregar US1 (MVP) e validar independente.
3. Entregar US2 e validar independente.
4. Entregar US3 e validar independente.
5. Fechar ajustes de qualidade na Phase 6.

### Parallel Team Strategy

1. Time fecha Setup e Foundational em conjunto.
2. Após checkpoint de fundação:
   - Dev A: US1
   - Dev B: US2
   - Dev C: US3
3. Convergência final na Phase 6 com foco em a11y/performance/observabilidade.

---

## Notes

- Tarefas com `[P]` não compartilham arquivo crítico ou dependência incompleta.
- Labels `[US1]`, `[US2]` e `[US3]` aparecem somente nas fases de história.
- Cada história mantém critério de teste independente conforme a spec.
- Commits devem ser feitos por blocos lógicos de tarefa concluída.
