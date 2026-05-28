# Tasks: Gestao de Carteiras, Contas e Transacoes

**Feature Branch**: `001-carteiras-transacoes`

**Input**: Documentos de design de `/specs/001-carteiras-transacoes/`

**Prerequisites**: plan.md (obrigatorio), spec.md (obrigatorio), research.md, data-model.md, contracts/frontend-api.yaml, quickstart.md

**Tests**: As tarefas de teste sao obrigatorias nesta feature porque spec/plan exigem comprovacao de FR-014/SC-013 e NFR-003.

**Organization**: As tarefas estao agrupadas por historia de usuario para permitir implementacao e validacao independentes.

## Formato: `[ID] [P?] [Story?] Descricao com caminho de arquivo`

---

## Fase 1: Setup (Inicializacao do Projeto)

**Purpose**: Preparar toolchain e estrutura base do projeto.

- [ ] T001 Inicializar projeto React + TypeScript strict em package.json e tsconfig.json
- [ ] T002 Configurar entrada e build do Vite em vite.config.ts e src/main.tsx
- [ ] T003 [P] Configurar ESLint e Prettier em eslint.config.js e .prettierrc
- [ ] T004 [P] Configurar Vitest e Testing Library em vitest.config.ts e tests/setup.ts
- [ ] T005 [P] Configurar Playwright em playwright.config.ts e tests/e2e/.gitkeep
- [ ] T006 Criar estrutura inicial de pastas em src/app/router/.gitkeep e src/features/.gitkeep

---

## Fase 2: Fundacao (Pre-requisitos Bloqueantes)

**Purpose**: Entregas compartilhadas obrigatorias antes de qualquer historia de usuario.

**CRITICAL**: Todas as tarefas desta fase devem ser concluidas antes de iniciar US1/US2/US3.

- [ ] T007 Definir tipos de dominio compartilhados (Wallet, Account, Card, Transaction, Permission, AuditEvent) em src/types/domain.ts
- [ ] T008 [P] Implementar cliente de API e helpers de query em src/services/api/client.ts e src/services/api/queries.ts
- [ ] T009 [P] Implementar bootstrap do MSW e handlers baseados no contrato em src/services/mock/browser.ts e src/services/mock/handlers.ts
- [ ] T010 [P] Implementar utilitarios de precisao financeira com decimal.js em src/shared/money.ts
- [ ] T011 [P] Implementar schemas Zod compartilhados de wallet/account/card/transaction em src/schemas/walletSchema.ts e src/schemas/transactionSchema.ts
- [ ] T012 Implementar mapa de rotas com guardas de autenticacao/papel e boundaries de erro em src/app/router/routes.tsx e src/app/router/guards.ts
- [ ] T062 [P] Criar testes unitarios de roteamento para parse de params e guardas de acesso em tests/unit/router/routerGuardsAndParams.test.ts [Req: Constitution-III]
- [ ] T063 [P] Criar testes de integracao de navegacao com deep links, fallback e error boundaries em tests/integration/router/routerNavigationContractFlow.test.ts [Req: Constitution-III]
- [ ] T064 [P] Criar cenario E2E de contrato de navegacao (params, guards, redirecionamentos e recuperacao de erro) em tests/e2e/router-contract.spec.ts [Req: Constitution-III]
- [ ] T013 [P] Implementar mapeamento de terminologia de permissao (leitura/leitura+edicao/acesso_total_operacional) em src/features/permissions/permissionLabels.ts
- [ ] T014 [P] Implementar builder e dispatcher centralizados de auditoria em src/features/audit/auditEventBuilder.ts e src/features/audit/auditDispatcher.ts [Req: FR-014, FR-014A]
- [ ] T015 [P] Criar testes de contrato do schema AuditEvent e endpoint de auditoria em tests/contract/audit-events.contract.test.ts [Req: FR-014, SC-013]
- [ ] T016 [P] Criar utilitarios compartilhados de teste de acessibilidade (teclado/foco/aria) em tests/integration/a11y/a11yTestUtils.ts [Req: NFR-003]

**Checkpoint**: Fundacao concluida; historias podem ser implementadas de forma independente.

---

## Fase 3: User Story 1 - Operar uma carteira financeira (Priority: P1) MVP

**Goal**: Permitir operacoes de transacao (entrada/saida/transferencia), efeito de status em saldos e visualizacao consolidada da carteira.

**Independent Test**: Registrar entrada/saida/transferencia, validar impacto por status (principal/projetado) e confirmar comportamento de periodo em transferencia.

### Testes da User Story 1

- [ ] T017 [P] [US1] Criar testes unitarios para calculo de saldo principal/projetado em tests/unit/transactions/balanceRules.test.ts [Req: FR-016, FR-017, FR-018]
- [ ] T018 [P] [US1] Criar testes unitarios para restricoes de recorrencia em transferencia em tests/unit/transactions/transferPeriodRules.test.ts [Req: FR-019, FR-020, FR-020B, SC-014]
- [ ] T019 [P] [US1] Criar teste de integracao do comportamento e validacao do formulario de transacao em tests/integration/transactions/transactionFormFlow.test.ts [Req: FR-004, FR-005, FR-006, FR-007]
- [ ] T020 [P] [US1] Criar teste de integracao da emissao de auditoria em mudanca de status com changedFields em tests/integration/audit/us1-transaction-audit.test.ts [Req: FR-014, SC-013]
- [ ] T021 [P] [US1] Criar testes de integracao de acessibilidade da US1 (teclado/foco/erros) em tests/integration/a11y/us1-transactions.a11y.test.ts [Req: NFR-003, SC-016]
- [ ] T022 [P] [US1] Criar cenario E2E da jornada de transacoes com asserts de auditoria em tests/e2e/us1-transactions.spec.ts [Req: SC-002, SC-006, SC-008, SC-013]

### Implementacao da User Story 1

- [ ] T023 [P] [US1] Implementar servico de dominio de transacoes (criar/editar/excluir/status) em src/features/transactions/transactionService.ts [Req: FR-004, FR-006]
- [ ] T024 [US1] Implementar regras de transferencia e logica de limpar/ocultar periodo em src/features/transactions/transactionFormState.ts [Req: FR-019, FR-020, FR-020B]
- [ ] T025 [US1] Implementar UI do formulario de transacao com RHF + Zod em src/features/transactions/components/TransactionForm.tsx [Req: FR-004, FR-007]
- [ ] T026 [US1] Implementar lista de transacoes e filtros por periodo/status em src/features/transactions/components/TransactionList.tsx [Req: FR-015]
- [ ] T027 [US1] Implementar widget de consolidado da carteira em src/features/transactions/components/WalletConsolidatedSummary.tsx [Req: FR-015]
- [ ] T028 [US1] Implementar integracao de auditoria de transacao (criar/editar/excluir/status) em src/features/transactions/transactionAuditBridge.ts [Req: FR-014, SC-013]
- [ ] T029 [US1] Implementar ajustes de acessibilidade da US1 (ordem de tab, labels, erros com aria-live, focus trap de modal) em src/features/transactions/components/TransactionForm.tsx [Req: NFR-003, SC-016]

**Checkpoint**: US1 concluida e validavel de forma independente como MVP.

---

## Fase 4: User Story 2 - Estruturar contas, cartoes e limite de carteiras (Priority: P2)

**Goal**: Gerenciar carteiras/contas/cartoes com limite, arquivamento, recalc por hard-delete e restricoes de estorno.

**Independent Test**: Validar limite de carteiras, ciclo de vida de conta/cartao, bloqueios de exclusao, escopo de recalculo e regras de estorno.

### Testes da User Story 2

- [ ] T030 [P] [US2] Criar testes unitarios das regras de dominio de carteira/conta/cartao em tests/unit/accounts-cards/domainRules.test.ts [Req: FR-001, FR-021, FR-022, FR-023, FR-028]
- [ ] T031 [P] [US2] Criar testes unitarios do escopo de recalculo apos hard-delete em tests/unit/accounts-cards/recalculationScope.test.ts [Req: FR-025, FR-026, FR-027, SC-010]
- [ ] T032 [P] [US2] Criar testes unitarios das regras de estorno parcial/total em tests/unit/cards/refundRules.test.ts [Req: FR-031, SC-012]
- [ ] T033 [P] [US2] Criar teste de integracao de CRUD e arquivamento de conta/cartao em tests/integration/accounts-cards/lifecycleFlow.test.ts [Req: FR-002, FR-003, FR-024]
- [ ] T034 [P] [US2] Criar teste de integracao de bloqueio de exclusao de conta com cartao vinculado em tests/integration/accounts-cards/accountDeleteGuardFlow.test.ts [Req: FR-028, FR-028A, SC-011]
- [ ] T035 [P] [US2] Criar teste de integracao da emissao de auditoria nas operacoes de conta/cartao em tests/integration/audit/us2-account-card-audit.test.ts [Req: FR-014, SC-013]
- [ ] T036 [P] [US2] Criar testes de integracao de acessibilidade da US2 (formularios/modais/retorno de foco) em tests/integration/a11y/us2-accounts-cards.a11y.test.ts [Req: NFR-003, SC-016]
- [ ] T037 [P] [US2] Criar cenario E2E da jornada de carteira/conta/cartao com verificacao de recalculo em tests/e2e/us2-accounts-cards.spec.ts [Req: SC-003, SC-009, SC-010]

### Implementacao da User Story 2

- [ ] T038 [P] [US2] Implementar servico de carteiras com regra de no maximo duas carteiras em src/features/wallets/walletService.ts [Req: FR-001]
- [ ] T039 [P] [US2] Implementar servico de contas com arquivar/reativar e hooks de bloqueio de exclusao em src/features/accounts/accountService.ts [Req: FR-002, FR-021, FR-028, FR-028A]
- [ ] T040 [P] [US2] Implementar servico de cartoes com vinculo/alteracao de conta de debito em src/features/cards/cardService.ts [Req: FR-029, FR-030]
- [ ] T041 [US2] Implementar fluxos de hard-delete e recalculo por carteira em src/features/accounts/accountHardDeleteService.ts e src/features/cards/cardHardDeleteService.ts [Req: FR-025, FR-026, FR-027]
- [ ] T042 [US2] Implementar servico e fluxo de UI para estorno parcial/total em src/features/cards/refundService.ts e src/features/cards/components/RefundForm.tsx [Req: FR-031]
- [ ] T043 [US2] Implementar ponte de integracao de auditoria para conta/cartao em src/features/accounts/accountsAuditBridge.ts e src/features/cards/cardsAuditBridge.ts [Req: FR-014, SC-013]
- [ ] T044 [US2] Implementar ajustes de acessibilidade da US2 para formularios e modais de confirmacao em src/features/accounts/components/AccountForm.tsx e src/features/cards/components/CardForm.tsx [Req: NFR-003, SC-016]

**Checkpoint**: US2 concluida e validavel de forma independente.

---

## Fase 5: User Story 3 - Compartilhar carteira por convite e permissao (Priority: P3)

**Goal**: Habilitar convite de colaborador, alteracao de permissao e bloqueios de acoes estruturais.

**Independent Test**: Convidar colaborador, alterar niveis de permissao, validar bloqueios estruturais e confirmar trilha de auditoria.

### Testes da User Story 3

- [ ] T045 [P] [US3] Criar testes unitarios da matriz de permissao e mapeamento de terminologia em tests/unit/permissions/permissionMatrix.test.ts [Req: FR-009, FR-010, FR-011, FR-012, FR-013]
- [ ] T046 [P] [US3] Criar teste de integracao de upsert de convite e propagacao de mudanca de permissao em tests/integration/permissions/collaborationFlow.test.ts [Req: FR-008, FR-009]
- [ ] T047 [P] [US3] Criar teste de integracao de bloqueios estruturais por permissao em tests/integration/permissions/structuralBlockFlow.test.ts [Req: FR-013, SC-004, SC-007]
- [ ] T048 [P] [US3] Criar teste de integracao dos eventos de auditoria de convite/permissao em tests/integration/audit/us3-invite-permission-audit.test.ts [Req: FR-014, SC-013]
- [ ] T049 [P] [US3] Criar testes de integracao de acessibilidade da US3 (convites/permissoes) em tests/integration/a11y/us3-collaboration.a11y.test.ts [Req: NFR-003, SC-016]
- [ ] T050 [P] [US3] Criar cenario E2E da jornada de colaboracao com checks de auditoria e restricoes em tests/e2e/us3-collaboration.spec.ts [Req: SC-004, SC-007, SC-013]

### Implementacao da User Story 3

- [ ] T051 [P] [US3] Implementar servicos de convite e permissao em src/features/invitations/invitationService.ts e src/features/permissions/permissionService.ts [Req: FR-008, FR-009]
- [ ] T052 [US3] Implementar painel de colaboradores e controles de permissao em src/features/permissions/components/CollaboratorsPanel.tsx [Req: FR-009, FR-010, FR-011, FR-012]
- [ ] T053 [US3] Implementar enforcement de rota/acao para restricoes estruturais em src/app/router/guards.ts e src/features/permissions/permissionEnforcement.ts [Req: FR-013]
- [ ] T054 [US3] Implementar ponte de integracao de auditoria para convite/permissao em src/features/invitations/invitationsAuditBridge.ts e src/features/permissions/permissionsAuditBridge.ts [Req: FR-014, SC-013]
- [ ] T055 [US3] Implementar ajustes de acessibilidade da US3 para interacoes de convite/permissao em src/features/permissions/components/CollaboratorsPanel.tsx [Req: NFR-003, SC-016]

**Checkpoint**: US3 concluida e validavel de forma independente.

---

## Fase 6: Polish & Cross-Cutting Concerns

**Purpose**: Gates finais de qualidade, verificacoes transversais e prontidao para release.

- [ ] T056 [P] Criar testes da matriz de cobertura de auditoria entre dominios (account/card/transaction/invite/permission) em tests/integration/audit/auditCoverageMatrix.test.ts [Req: FR-014, SC-013]
- [ ] T057 [P] Criar testes de regressao de imutabilidade da auditoria em cenarios de hard-delete em tests/integration/audit/auditImmutabilityRegression.test.ts [Req: FR-014A, SC-015]
- [ ] T058 [P] Criar suite consolidada de regressao de acessibilidade para US1/US2/US3 em tests/e2e/a11y-critical-journeys.spec.ts [Req: NFR-003, SC-016]
- [ ] T059 [P] Criar suite de validacao de performance da listagem de transacoes com p90 <= 2s em tests/integration/performance/transactions-p90.test.ts [Req: NFR-005, SC-005]
- [ ] T060 Configurar gate obrigatorio de CI com typecheck, lint, testes e build em .github/workflows/ci.yml
- [ ] T061 Atualizar passos de validacao no quickstart e checklist de evidencias de requisitos em specs/001-carteiras-transacoes/quickstart.md
- [ ] T065 [P] Criar testes de integracao para telemetria estruturada e sinais de erro em tests/integration/observability/observabilityFlow.test.ts [Req: NFR-004]
- [ ] T066 [P] Implementar dispatcher append-only do journal de mutacoes e projecoes derivadas em src/features/persistence/walletMutationJournal.ts e src/features/persistence/walletSnapshotProjection.ts [Req: FR-002, FR-014A, FR-027]
- [ ] T067 [P] Implementar servicos de telemetria e error signal correlacionados com rota/carteira/sessao em src/features/observability/telemetryService.ts e src/features/observability/errorSignalService.ts [Req: NFR-004]
- [ ] T068 Atualizar contrato e fixtures de observabilidade em specs/001-carteiras-transacoes/contracts/frontend-api.yaml e src/services/mock/fixtures/observability.json [Req: NFR-004]

---

## Dependencias e Ordem de Execucao

### Dependencias por fase

- Fase 1 -> inicia imediatamente.
- Fase 2 -> depende da Fase 1 e bloqueia todas as historias.
- Fase 3 (US1), Fase 4 (US2), Fase 5 (US3) -> cada uma depende da Fase 2.
- Fase 6 -> depende da conclusao das historias selecionadas para release.
- Checkpoint final de release -> depende obrigatoriamente da conclusao de T060 (gate de CI) e T061.

### Dependencias entre historias

- US1 (P1) -> sem dependencia de outras historias apos Fase 2.
- US2 (P2) -> sem dependencia de US1 apos Fase 2; integra apenas fundamentos compartilhados.
- US3 (P3) -> sem dependencia de US1/US2 apos Fase 2; depende da fundacao de permissao/auditoria.

### Ordem interna por historia (para cada US)

- Primeiro tarefas de teste (unit/integration/e2e).
- Depois implementacao de servicos/dominio.
- Depois integracao de UI.
- Antes do checkpoint da historia, concluir auditoria e acessibilidade da propria US.

### Oportunidades de paralelismo

- Setup em paralelo: T003, T004, T005.
- Fundacao em paralelo: T008, T009, T010, T011, T013, T014, T015, T016, T062, T063.
- Testes US1 em paralelo: T017-T022.
- Testes US2 em paralelo: T030-T037.
- Testes US3 em paralelo: T045-T050.
- Regressoes finais em paralelo: T056, T057, T058, T059.

---

## Matriz de Rastreabilidade (Tarefas -> Requisitos)

- FR-014, SC-013 (auditoria completa): T014, T015, T020, T028, T035, T043, T048, T054, T056
- FR-014A, SC-015 (imutabilidade de auditoria): T014, T057
- NFR-003, SC-016 (acessibilidade por jornada):
  - US1: T021, T029
  - US2: T036, T044
  - US3: T049, T055
  - Regressao transversal: T058
- FR-009/FR-010/FR-011/FR-012/FR-013 (matriz de permissao): T013, T045, T047, T051, T052, T053
- FR-019/FR-020/FR-020B, SC-014 (transferencia sem recorrencia): T018, T024
- FR-025/FR-026/FR-027, SC-010 (hard-delete + recalculo por carteira): T031, T041
- NFR-004 (observabilidade estruturada por acao critica): T065, T067, T068
- FR-002/FR-014A/FR-027 (persistencia append-only e projecoes derivadas): T066
- Constitution III (contrato de navegacao com params/guards/error boundaries): T012, T062, T063, T064

---

## Estrategia de Implementacao

### MVP primeiro (somente US1)

1. Concluir Fase 1 e Fase 2.
2. Concluir US1 (T017-T029).
3. Validar US1 de forma independente contra FR/SC mapeados.
4. Demonstrar/entregar MVP.

### Entrega incremental

1. Base pronta (Fase 1 + Fase 2).
2. Entregar US1, depois US2, depois US3 com validacoes independentes.
3. Executar Fase 6 e liberar somente apos CI gate obrigatorio (T060) aprovado.

### Estrategia de time em paralelo

1. O time conclui fundacao em conjunto.
2. Apos T016:
   - Dev A executa US1
   - Dev B executa US2
   - Dev C executa US3
3. Executar Fase 6 em conjunto.

---

## Notas

- Todas as tarefas seguem formato estrito de checklist com ID e caminho de arquivo.
- O marcador [P] e usado apenas em tarefas que podem rodar em paralelo com seguranca.
- O marcador [USx] aparece somente nas fases de historias de usuario.
- IDs de requisitos estao embutidos nas descricoes para rastreabilidade direta.
