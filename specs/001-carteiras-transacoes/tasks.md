# Tasks: Gestao de Carteiras, Contas e Transacoes

**Input**: Design documents from `/specs/001-carteiras-transacoes/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/frontend-api.yaml, quickstart.md

**Tests**: Testes sao obrigatorios nesta feature porque a spec e o plano exigem o baseline minimo de interface, validacao de formularios, cobertura de permissao na UI e evidencias de integridade financeira.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup

**Purpose**: Inicializar o app React, o toolchain e a estrutura alvo definida no plano.

- [x] T001 Inicializar o projeto React 19 + TypeScript strict em ./package.json e ./tsconfig.json
- [x] T002 Configurar Vite, bootstrap da aplicacao e providers base em ./vite.config.ts, src/main.tsx e src/app/providers/AppProviders.tsx
- [x] T003 [P] Configurar ESLint e Prettier em ./eslint.config.js, ./.prettierrc e ./.prettierignore
- [x] T004 [P] Configurar Vitest e Testing Library em ./vitest.config.ts e tests/setup.ts
- [x] T006 Criar a estrutura inicial de app e features em src/app/router/.gitkeep, src/features/.gitkeep, src/services/.gitkeep e src/schemas/.gitkeep

---

## Phase 2: Foundational

**Purpose**: Entregar a infraestrutura compartilhada que bloqueia todas as historias de usuario.

**CRITICAL**: Nenhuma historia pode comecar antes desta fase terminar.

- [x] T007 Definir os tipos de dominio compartilhados em src/features/shared/types/domain.ts
- [x] T008 [P] Implementar utilitarios de dinheiro e datas com decimal-safe arithmetic em src/lib/money.ts e src/lib/dates.ts
- [x] T009 [P] Implementar schemas Zod compartilhados de carteira, conta, cartao, transacao e permissao em src/schemas/walletSchemas.ts e src/schemas/transactionSchemas.ts
- [x] T093 [P] Implementar schema e validacao de timezone IANA da carteira e normalizacao de timezone default em src/schemas/walletSchemas.ts e src/features/wallets/timezone/timezoneSchema.ts
- [x] T094 [P] Implementar utilitarios de conversao UTC-local por timezone da carteira para periodo, recorrencia e fechamento diario em src/lib/dates.ts e src/features/wallets/timezone/timezoneService.ts
- [x] T095 [P] Criar teste unitario das regras de timezone da carteira (IANA), conversao UTC e fechamento diario em tests/unit/wallets/timezoneRules.test.ts
- [x] T010 [P] Implementar cliente HTTP, chaves de query e adapters de resposta em src/services/api/client.ts e src/services/api/queryKeys.ts
- [x] T011 [P] Implementar bootstrap do MSW e handlers baseados em contracts/frontend-api.yaml em src/services/mock/browser.ts, src/services/mock/handlers.ts e src/services/mock/fixtures/wallets.json
- [x] T012 Implementar o mapa de rotas por carteira, guards de autenticacao-permissao e error boundaries em src/app/router/routes.tsx e src/app/router/guards.tsx
- [x] T013 [P] Criar testes unitarios obrigatorios do contrato de navegacao para params de rota e guardas de autenticacao-permissao em tests/unit/router/routeGuardRules.test.ts
- [x] T014 [P] Criar testes de integracao obrigatorios do contrato de navegacao para deep links, back-forward e 404 por carteira em tests/integration/router/navigationContract.test.tsx
- [x] T016 [P] Implementar o store append-only de auditoria e journal de mutacoes em src/features/audit/auditStore.ts e src/features/persistence/walletMutationJournal.ts
- [x] T017 [P] Implementar a base de telemetria e sinais de erro com correlacao de rota e sessao em src/features/observability/telemetryService.ts e src/features/observability/errorSignalService.ts
- [x] T018 [P] Implementar o shell autenticado e carregamento da sessao mock em src/app/layout/AppShell.tsx e src/features/wallets/session/sessionService.ts

**Checkpoint**: Fundacao pronta; US1, US2 e US3 podem ser executadas em paralelo.

---

## Phase 3: User Story 1 - Operar uma carteira financeira (Priority: P1)

**Goal**: Permitir criar e visualizar transacoes com saldo principal-projetado, recorrencia para entrada e saida, e regra visual correta para transferencia.

**Independent Test**: Em uma carteira com contas ativas, o usuario consegue criar entrada, saida e transferencia; o formulario valida dados; transferencia oculta e limpa periodo; resumo e lista refletem os calculos corretos.

### Tests for User Story 1

- [x] T019 [P] [US1] Criar teste unitario das regras de saldo principal e saldo projetado em tests/unit/transactions/balanceProjection.test.ts
- [x] T020 [P] [US1] Criar teste unitario das regras de transferencia sem recorrencia e da regra FR-004A (cartao nao pode ser origem-destino financeiro) em tests/unit/transactions/transferRules.test.ts
- [x] T021 [P] [US1] Criar teste de integracao da renderizacao da tela de dashboard e estados loading-empty-error em tests/integration/transactions/dashboardStates.test.tsx
- [x] T022 [P] [US1] Criar teste de integracao da validacao do formulario de transacao e do bloqueio de envio invalido em tests/integration/transactions/transactionFormValidation.test.tsx
- [x] T023 [P] [US1] Criar teste de integracao do fluxo feliz de criacao de entrada e saida com feedback visual em tests/integration/transactions/transactionHappyPath.test.tsx
- [x] T024 [P] [US1] Criar teste de integracao da regra visual de transferencia e limpeza do campo period em tests/integration/transactions/transferPeriodVisibility.test.tsx
- [x] T025 [P] [US1] Criar teste de integracao da regressao de calculo exibido no resumo e na lista em tests/integration/transactions/walletSummaryRecalculation.test.tsx
- [x] T026 [P] [US1] Criar teste de integracao de acessibilidade da jornada de transacoes incluindo foco preso em modal-confirm dialog e retorno ao elemento de origem em tests/integration/a11y/us1-transactions.a11y.test.tsx
- [x] T027 [P] [US1] Criar teste de integracao de telemetria e ErrorSignal em mutacoes criticas e falhas de carregamento de transacoes com erro visivel ao usuario em tests/integration/observability/us1-transactions-observability.test.tsx
- [x] T038 [P] [US1] Criar teste de integracao da listagem de despesas com despesas de cartao e filtro por cartao em tests/integration/expenses/expenseListWithCardFilter.test.tsx
- [x] T039 [P] [US1] Criar teste de integracao da acao de pagar despesa com debito em conta e atualizacao de status no historico em tests/integration/expenses/payCardExpenseFlow.test.tsx
- [x] T040 [P] [US1] Criar teste unitario do detector de duplicidade com janela de 5 minutos para criacao e edicao em tests/unit/transactions/duplicateDetectionWindow.test.ts
- [x] T041 [P] [US1] Criar teste de integracao do tratamento de resposta 409 com confirmacao explicita antes de persistir em tests/integration/transactions/duplicateConfirmationFlow.test.tsx
- [x] T096 [P] [US1] Criar teste de integracao do uso de timezone IANA da carteira nos calculos de periodo/recorrencia com persistencia UTC de timestamps em tests/integration/transactions/walletTimezoneRenderingAndPersistence.test.tsx

### Implementation for User Story 1

- [x] T029 [P] [US1] Implementar o servico de transacoes com regras de status, recorrencia, transferencia e enforcement explicito de FR-004A em src/features/transactions/transactionService.ts
- [x] T030 [P] [US1] Implementar a projecao de saldo da carteira e agregados por periodo em src/features/transactions/walletProjection.ts
- [x] T031 [US1] Implementar a pagina de dashboard da carteira em src/features/transactions/pages/WalletDashboardPage.tsx
- [x] T032 [US1] Implementar o formulario de transacao com React Hook Form e Zod em src/features/transactions/components/TransactionForm.tsx
- [x] T033 [US1] Implementar a lista de transacoes com filtros de periodo e status em src/features/transactions/components/TransactionList.tsx
- [x] T034 [US1] Implementar o resumo consolidado com saldo principal, saldo projetado e totais em src/features/transactions/components/WalletSummaryCard.tsx
- [x] T035 [US1] Integrar auditoria e emissao de journal nas mutacoes de transacao em src/features/transactions/transactionAuditBridge.ts
- [x] T036 [US1] Implementar ajustes de acessibilidade da jornada de transacoes em src/features/transactions/components/TransactionForm.tsx e src/features/transactions/pages/WalletDashboardPage.tsx
- [x] T037 [US1] Instrumentar TelemetryEvent e ErrorSignal nas mutacoes criticas e falhas de carregamento de transacoes com estado de erro visivel ao usuario em src/features/transactions/transactionObservability.ts e src/features/transactions/pages/WalletDashboardPage.tsx
- [x] T042 [P] [US1] Implementar servico de despesas para listagem geral, filtro por cartao e pagamento com debito em conta em src/features/expenses/expenseService.ts
- [x] T043 [US1] Implementar UI da listagem de despesas com filtro por cartao e acao pagar despesa em src/features/expenses/components/ExpenseList.tsx e src/features/expenses/components/PayExpenseAction.tsx
- [x] T044 [P] [US1] Implementar detector de duplicidade com janela de 5 minutos e fingerprint por valor-data-tipo-vinculo em src/features/transactions/duplicateDetectionService.ts
- [x] T045 [US1] Implementar tratamento de 409 na UI com fluxo de confirmacao explicita antes de persistir em src/features/transactions/components/TransactionForm.tsx e src/features/transactions/hooks/useDuplicateConfirmation.ts
- [x] T097 [US1] Integrar timezone IANA da carteira no calculo de periodo/recorrencia e garantir serializacao persistida em UTC nas mutacoes em src/features/transactions/transactionService.ts e src/features/transactions/components/TransactionForm.tsx

**Checkpoint**: US1 pronta como MVP e validavel de forma independente.

---

## Phase 4: User Story 2 - Estruturar contas, cartoes e limite de carteiras (Priority: P2)

**Goal**: Gerenciar carteiras, contas e cartoes com limite de duas carteiras, arquivamento, bloqueios de exclusao e recalc por hard-delete.

**Independent Test**: O usuario consegue criar ate duas carteiras, arquivar e reativar contas-cartoes, alterar conta de debito do cartao e ver bloqueio de exclusao quando houver vinculos ativos.

### Tests for User Story 2

- [x] T046 [P] [US2] Criar teste unitario das regras de limite de carteiras e estados ativo-inativo em tests/unit/wallets/walletRules.test.ts
- [x] T047 [P] [US2] Criar teste unitario do recalc apos hard-delete de conta e cartao em tests/unit/accounts-cards/hardDeleteRecalculation.test.ts
- [x] T048 [P] [US2] Criar teste unitario das regras de estorno parcial e total em tests/unit/cards/refundRules.test.ts
- [x] T049 [P] [US2] Criar teste de integracao obrigatorio da validacao de AccountForm e CardForm com bloqueio de envio invalido em tests/integration/accounts-cards/formsValidation.test.tsx
- [x] T050 [P] [US2] Criar teste de integracao obrigatorio dos estados loading-empty-error das listagens de contas e cartoes em tests/integration/accounts-cards/listStates.test.tsx
- [x] T051 [P] [US2] Criar teste de integracao do CRUD e arquivamento de contas-cartoes incluindo FR-003A (tela de cartao lista despesas e creditos vinculados) em tests/integration/accounts-cards/lifecycleFlow.test.tsx
- [x] T052 [P] [US2] Criar teste de integracao do bloqueio de exclusao de conta com cartao vinculado em tests/integration/accounts-cards/accountDeleteGuard.test.tsx
- [x] T053 [P] [US2] Criar teste de integracao da orientacao de troca ou desvinculacao antes da exclusao em tests/integration/accounts-cards/accountDeleteGuidance.test.tsx
- [x] T054 [P] [US2] Criar teste de integracao de acessibilidade da jornada de contas e cartoes incluindo foco preso em modal-confirm dialog e retorno ao elemento de origem em tests/integration/a11y/us2-accounts-cards.a11y.test.tsx
- [x] T055 [P] [US2] Criar teste de integracao de telemetria e ErrorSignal em mutacoes criticas, falhas de carregamento e bloqueios de exclusao de contas-cartoes em tests/integration/observability/us2-accounts-cards-observability.test.tsx

### Implementation for User Story 2

- [x] T057 [P] [US2] Implementar o servico de carteiras com limite maximo de duas por usuario em src/features/wallets/walletService.ts
- [x] T058 [P] [US2] Implementar o servico de contas com arquivar, reativar e bloqueios de exclusao em src/features/accounts/accountService.ts
- [x] T059 [P] [US2] Implementar o servico de cartoes com vinculo e troca de conta de debito com instrumentacao de latencia para FR-030A-SC-009 em src/features/cards/cardService.ts
- [x] T060 [P] [US2] Implementar endpoint-view de detalhe do cartao com registros vinculados para FR-003A em src/features/cards/cardDetailService.ts e src/features/cards/components/CardDetailRecords.tsx
- [x] T061 [US2] Implementar o fluxo de hard-delete e recalc da carteira atual em src/features/accounts/accountHardDeleteService.ts e src/features/cards/cardHardDeleteService.ts
- [x] T062 [US2] Implementar validacao explicita e mensagens por campo no AccountForm e CardForm em src/features/accounts/components/AccountForm.tsx e src/features/cards/components/CardForm.tsx
- [x] T063 [US2] Implementar estados loading-empty-error e feedback de erro visivel nas listagens AccountList e CardList em src/features/accounts/components/AccountList.tsx e src/features/cards/components/CardList.tsx
- [x] T064 [US2] Implementar o fluxo de estorno parcial e total em src/features/cards/refundService.ts e src/features/cards/components/RefundForm.tsx
- [x] T065 [US2] Integrar auditoria das operacoes de conta e cartao em src/features/accounts/accountsAuditBridge.ts e src/features/cards/cardsAuditBridge.ts
- [x] T066 [US2] Implementar ajustes de acessibilidade da jornada de contas e cartoes em src/features/accounts/components/AccountForm.tsx, src/features/accounts/components/AccountList.tsx, src/features/cards/components/CardForm.tsx e src/features/cards/components/CardList.tsx
- [x] T067 [US2] Instrumentar TelemetryEvent e ErrorSignal em mutacoes criticas, falhas de carregamento e bloqueios de contas-cartoes com erro visivel ao usuario em src/features/accounts/accountsObservability.ts e src/features/cards/cardsObservability.ts

**Checkpoint**: US2 pronta e validavel de forma independente.

---

## Phase 5: User Story 3 - Compartilhar carteira com outro usuario por e-mail (Priority: P3)

**Goal**: Permitir convites por e-mail, alteracao de permissao e protecao de UI conforme o papel do convidado.

**Independent Test**: O dono convida um colaborador, altera o nivel de permissao e a UI reage imediatamente ocultando ou bloqueando acoes nao permitidas sem afetar a estrutura da carteira.

### Tests for User Story 3

- [x] T068 [P] [US3] Criar teste unitario da matriz de permissao e do mapeamento leitura-edit-operate em tests/unit/permissions/permissionMatrix.test.ts
- [x] T069 [P] [US3] Criar teste de integracao do formulario de convite com validacao de e-mail em tests/integration/permissions/inviteFormValidation.test.tsx
- [x] T070 [P] [US3] Criar teste de integracao do upsert de convite e atualizacao imediata de permissao em tests/integration/permissions/collaborationFlow.test.tsx
- [x] T071 [P] [US3] Criar teste de integracao da protecao basica de permissao na UI em tests/integration/permissions/uiPermissionProtection.test.tsx
- [x] T072 [P] [US3] Criar teste de integracao de acessibilidade da jornada de colaboracao incluindo foco preso em modal-confirm dialog e retorno ao elemento de origem em tests/integration/a11y/us3-collaboration.a11y.test.tsx
- [x] T073 [P] [US3] Criar teste de integracao de telemetria e ErrorSignal em convites, mudancas de permissao e bloqueios visuais com erro visivel ao usuario em tests/integration/observability/us3-collaboration-observability.test.tsx

### Implementation for User Story 3

- [x] T075 [P] [US3] Implementar os servicos de convite e permissao por carteira em src/features/permissions/permissionService.ts e src/features/permissions/invitationService.ts
- [x] T076 [US3] Implementar o painel de colaboradores e niveis de acesso em src/features/permissions/components/CollaboratorsPanel.tsx
- [x] T077 [US3] Implementar enforcement de guardas e bloqueios visuais por papel em src/features/permissions/permissionEnforcement.ts e src/app/router/guards.tsx
- [x] T078 [US3] Integrar auditoria para convites e alteracoes de permissao em src/features/permissions/permissionsAuditBridge.ts
- [x] T079 [US3] Implementar ajustes de acessibilidade da jornada de colaboracao em src/features/permissions/components/CollaboratorsPanel.tsx
- [x] T080 [US3] Instrumentar TelemetryEvent e ErrorSignal em convites, mudancas de permissao e bloqueios visuais com erro visivel ao usuario em src/features/permissions/permissionsObservability.ts e src/features/permissions/components/CollaboratorsPanel.tsx

**Checkpoint**: US3 pronta e validavel de forma independente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Fechar quality gates, documentacao e validacoes transversais definidas pela constitution e pelo quickstart.

- [x] T081 [P] Criar teste de integracao da imutabilidade da auditoria apos hard-delete de negocio em tests/integration/audit/auditImmutability.test.tsx
- [x] T082 [P] Criar teste de integracao da separacao entre auditoria, telemetria e sinais de erro em tests/integration/observability/observabilitySeparation.test.tsx
- [x] T083 [P] Criar teste de validacao do budget de performance p90 <= 2s vinculado a NFR-005 e SC-008 em tests/integration/performance/criticalJourneysP90.test.ts
- [x] T084 [P] Criar teste de performance dedicado SC-009-FR-030A para operacoes de vinculo conta-cartao e registro-cartao (<1s) em tests/integration/performance/linkOperationsUnder1s.test.ts
- [x] T085 [P] Criar fixture do ambiente padrao para benchmark de vinculo e jornadas principais em tests/fixtures/performance/standardEnvironment.fixture.ts
- [x] T086 [P] Criar teste de integracao de acessibilidade basica por teclado, labels e mensagens de erro em tests/integration/a11y/criticalJourneysA11y.test.tsx
- [x] T087 Configurar o gate obrigatorio de CI com lint, typecheck, build e testes em .github/workflows/ci.yml
- [x] T088 Atualizar os passos de validacao e evidencias no quickstart da feature em specs/001-carteiras-transacoes/quickstart.md
- [x] T089 Executar a validacao final do quickstart e registrar o checklist de release em specs/001-carteiras-transacoes/checklists/quality.md
- [x] T090 [P] Criar teste de contrato da trilha de auditoria validando schema obrigatorio de eventos (walletId, autor, papel, acao, entidade, timestamp, changedFields) em tests/integration/audit/auditEventSchemaContract.test.ts
- [x] T091 [P] Criar teste de integracao transversal de modal-confirm dialog com foco preso e retorno ao gatilho original em tests/integration/a11y/modalFocusTrapAndReturn.test.tsx
- [x] T092 [P] Criar teste de integracao explicito do bloqueio de transferencia entre carteiras diferentes (FR-005) em tests/integration/transactions/crossWalletTransferGuard.test.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) inicia imediatamente.
- Foundational (Phase 2) depende da Setup e bloqueia todas as historias.
- US1, US2 e US3 dependem da conclusao da Foundational.
- Polish (Phase 6) depende das historias selecionadas para release.

### User Story Dependencies

- US1 e a entrega MVP inicial apos a fase foundational.
- US2 depende apenas da fundacao compartilhada e pode rodar em paralelo com US1.
- US3 depende apenas da fundacao compartilhada e pode rodar em paralelo com US1 e US2.

### Within Each User Story

- Escrever os testes da historia antes da implementacao.
- Implementar servicos e regras de dominio antes da UI.
- Concluir integracao com auditoria e journal antes do checkpoint da historia.

### Parallel Opportunities

- Setup em paralelo: T003, T004.
- Foundational em paralelo: T008, T009, T093, T094, T095, T010, T011, T013, T014, T016, T017.
- US1 em paralelo: T019-T027, T038-T044, T096.
- US2 em paralelo: T046-T055.
- US3 em paralelo: T068-T073.
- Polish em paralelo: T081, T082, T083, T084, T085, T086, T090, T091, T092.

---

## Parallel Example: User Story 1

```bash
Task: "Criar teste unitario das regras de saldo principal e saldo projetado em tests/unit/transactions/balanceProjection.test.ts"
Task: "Criar teste de integracao da validacao do formulario de transacao e do bloqueio de envio invalido em tests/integration/transactions/transactionFormValidation.test.tsx"
Task: "Criar teste de integracao da listagem de despesas com filtro por cartao em tests/integration/expenses/expenseListWithCardFilter.test.tsx"
Task: "Criar teste unitario do detector de duplicidade (janela de 5 minutos) em tests/unit/transactions/duplicateDetectionWindow.test.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Criar teste de integracao da validacao do AccountForm e CardForm em tests/integration/accounts-cards/formsValidation.test.tsx"
Task: "Criar teste de integracao dos estados loading-empty-error das listagens de contas e cartoes em tests/integration/accounts-cards/listStates.test.tsx"
Task: "Instrumentar TelemetryEvent e ErrorSignal em mutacoes, falhas de carregamento e bloqueios de contas-cartoes em src/features/accounts/accountsObservability.ts e src/features/cards/cardsObservability.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Criar teste de integracao do formulario de convite com validacao de e-mail em tests/integration/permissions/inviteFormValidation.test.tsx"
Task: "Criar teste de integracao de acessibilidade da jornada de colaboracao em tests/integration/a11y/us3-collaboration.a11y.test.tsx"
Task: "Instrumentar TelemetryEvent e ErrorSignal em convites, mudancas de permissao e bloqueios visuais em src/features/permissions/permissionsObservability.ts e src/features/permissions/components/CollaboratorsPanel.tsx"
```

---

## Implementation Strategy

### MVP First

1. Concluir Phase 1 e Phase 2.
2. Concluir US1.
3. Validar a jornada principal de transacoes como incremento minimo utilizavel.

### Incremental Delivery

1. Entregar a fundacao compartilhada.
2. Entregar US1 e validar o baseline minimo de interface.
3. Entregar US2 com bloqueios de exclusao, recalc e estornos.
4. Entregar US3 com convites, papeis e protecao de UI.
5. Fechar os gates finais de CI, observabilidade e acessibilidade complementar.

### Team Strategy

1. O time fecha Setup e Foundational em conjunto.
2. Depois disso, uma pessoa pode assumir US1, outra US2 e outra US3.
3. Polish fica para consolidacao final antes do merge.

---

## Notes

- Todas as tarefas seguem o formato estrito de checklist com ID, marcador opcional de paralelismo, marcador de historia quando aplicavel e caminho de arquivo.
- O baseline minimo de testes obrigatorios desta feature esta concentrado nas tarefas de teste de US1, US2 e US3.
- Acessibilidade e observabilidade possuem tarefas por jornada e regressao transversal final para evitar gaps de compliance com a constitution.
- Evidencias de release readiness devem ser registradas em specs/001-carteiras-transacoes/quickstart.md e specs/001-carteiras-transacoes/checklists/quality.md, mantendo tasks.md apenas como plano de trabalho.
- FR-032 possui cobertura explicita com tarefas dedicadas para timezone IANA da carteira, persistencia UTC e testes de regressao temporal (T093, T094, T095, T096, T097).
